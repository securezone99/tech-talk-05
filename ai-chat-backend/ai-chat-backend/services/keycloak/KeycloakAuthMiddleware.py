from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from services.keycloak.keycloak import get_keycloak_token_fallback
from models.keycloak.keycloakToken import KeycloakToken
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
import urllib.parse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KeycloakAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header:
                token = auth_header.split(" ")[1]
            else:
                token = request.query_params.get("token")

            # check for token in URL path
            if not token:
                path = urllib.parse.urlparse(request.url.path).path
                token = path.split('/')[-1]

            if not token:
                raise ValueError("Token is missing")

            keycloak_token: KeycloakToken = await get_keycloak_token_fallback(token)
            request.state.keycloak_token = keycloak_token

        except Exception as e:
            logger.warning(f"Token validation failed: {str(e)}")
            return JSONResponse(content={"detail": str(e)}, status_code=401)

        response = await call_next(request)
        return response
