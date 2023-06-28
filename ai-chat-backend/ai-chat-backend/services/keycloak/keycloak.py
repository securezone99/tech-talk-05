import os
import logging
import json
import requests
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from keycloak import KeycloakOpenID
from keycloak.exceptions import KeycloakInvalidTokenError
from models.keycloak.keycloakToken import KeycloakToken
from pydantic import ValidationError
from typing import List
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

keycloakServerUrl = os.getenv("KEYCLOAK_SERVER_URL")
clientId = os.getenv("KEYCLOAK_CLIENT_ID")
clientSecret = os.getenv("KEYCLOAK_CLIENT_SECRET")
realm = os.getenv("KEYCLOAK_REALM")
validIssuer = os.environ["KEYCLOAK_VALID_ISSUERS"].split(',')

keycloak_instance = KeycloakOpenID(
    server_url=keycloakServerUrl,
    client_id=clientId,
    realm_name=realm,
)


def get_keycloak_public_key():
    keys = keycloak_instance.public_key()
    public_key = f"-----BEGIN PUBLIC KEY-----\n{keys}\n-----END PUBLIC KEY-----"
    return public_key


async def get_admin_access_token():
    uri = f"{keycloakServerUrl}/realms/{realm}/protocol/openid-connect/token"
    content = {
        "grant_type": "client_credentials",
        "client_id": clientId,
        "client_secret": clientSecret
    }

    response = requests.post(uri, data=content)

    if response.status_code != 200:
        logger.error("Failed to retrieve admin access token")
        raise HTTPException(status_code=500, detail="Internal server error")

    jsonResponse = json.loads(response.text)
    return jsonResponse["access_token"]


async def get_user_sessions(user_id: str, admin_access_token: str) -> List[dict]:
    url = f"{keycloakServerUrl}/admin/realms/{realm}/users/{user_id}/sessions"
    headers = {
        "Authorization": f"Bearer {admin_access_token}"
    }
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        logger.error("Failed to retrieve user sessions")
        return []


async def get_keycloak_token_fallback(token: str):

    keycloak_token = await get_keycloak_token(token)

    # Check if the issuer is in the list of valid issuers
    if keycloak_token.iss not in validIssuer:
        logger.warning(f"Invalid issuer: {keycloak_token.iss}")
        raise HTTPException(status_code=401, detail="Invalid issuer")

    # Check for active sessions
    admin_access_token = await get_admin_access_token()
    user_sessions = await get_user_sessions(keycloak_token.sub, admin_access_token)
    if not user_sessions:
        logger.warning(
            f"User {keycloak_token.sub} does not have any active sessions")
        raise HTTPException(status_code=401, detail="Invalid or revoked token")

    return keycloak_token


async def get_keycloak_token(token: str = Depends(OAuth2PasswordBearer(tokenUrl="token"))):
    try:
        # Decode and validate the token
        public_key = get_keycloak_public_key()
        options = {"verify_aud": False}  # Disable audience verification
        keycloak_token_dict = keycloak_instance.decode_token(
            token, public_key, options=options)

        # Parse the token dictionary into the KeycloakClaims object
        keycloak_token = KeycloakToken(**keycloak_token_dict)

        # Check if the issuer is in the list of valid issuers
        if keycloak_token.iss not in validIssuer:
            logger.warning(f"Invalid issuer: {keycloak_token.iss}")
            raise HTTPException(status_code=401, detail="Invalid issuer")

        # Check for active sessions
        admin_access_token = await get_admin_access_token()
        user_sessions = await get_user_sessions(keycloak_token.sub, admin_access_token)
        if not user_sessions:
            logger.warning(
                f"User {keycloak_token.sub} does not have any active sessions")
            raise HTTPException(
                status_code=401, detail="Invalid or revoked token")

        return keycloak_token

    except (KeycloakInvalidTokenError, ValidationError) as e:
        logger.error(f"Token validation failed: {e}")
    raise HTTPException(status_code=401, detail="Invalid token")
