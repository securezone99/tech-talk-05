from typing import List, Dict, Optional
from pydantic import BaseModel


class RoleAccess(BaseModel):
    roles: List[str]


class ResourceAccess(BaseModel):
    realm_management: Optional[RoleAccess]
    backend: RoleAccess
    account: RoleAccess


class KeycloakToken(BaseModel):
    exp: int
    iat: int
    auth_time: int
    jti: str
    iss: str
    aud: List[str]
    sub: str
    typ: str
    azp: str
    nonce: str
    session_state: str
    acr: str
    allowed_origins: Optional[List[str]]
    resource_access: Optional[ResourceAccess]
    scope: str
    sid: str
    uid: str
    email_verified: bool
    name: str
    preferred_username: str
    given_name: str
    family_name: str
    email: str
