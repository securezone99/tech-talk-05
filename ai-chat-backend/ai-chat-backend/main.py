from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api import api_router
from services.keycloak.KeycloakAuthMiddleware import KeycloakAuthMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from services.conversationService import check_old_conversations
from apscheduler.schedulers.background import BackgroundScheduler
from services.conversationService import check_old_conversations

ai_chat_backend = FastAPI()
limiter = Limiter(key_func=get_remote_address)

ai_chat_backend.state.limiter = limiter
ai_chat_backend.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
ai_chat_backend.add_middleware(KeycloakAuthMiddleware)

origins = [
    "http://localhost:4200"
]

ai_chat_backend.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_chat_backend.include_router(api_router)

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_old_conversations, "interval", minutes=240)
    scheduler.start()
    
@ai_chat_backend.on_event("startup")
async def startup_event():
    print("Application has started")
    start_scheduler()
    