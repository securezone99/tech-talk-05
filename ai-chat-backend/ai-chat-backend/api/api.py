from fastapi import APIRouter
from api.routes import conversationController

api_router = APIRouter()
api_router.include_router(conversationController.router,
                          prefix="/copilotAssistentProject", tags=["conversation"])
