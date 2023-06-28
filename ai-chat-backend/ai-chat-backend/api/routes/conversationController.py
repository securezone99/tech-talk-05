import json
import logging
from typing import Dict

from utils.datetime_encoder import DateTimeEncoder
from models.notificationMessageType import NotificationMessageType
from utils.pydanticEncoder import PydanticEncoder
from utils.errorHandlingException import ErrorMessageException
from starlette.websockets import WebSocketDisconnect
from slowapi import Limiter
from models.websocket.websocketActions import WebsocketAction
from fastapi import APIRouter, HTTPException, Request, WebSocket
from slowapi import Limiter
from models.keycloak.keycloakToken import KeycloakToken
from services.keycloak.keycloak import get_keycloak_token_fallback
from services.conversationService import *
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)

# API limiters
limiter = Limiter(key_func=get_remote_address)
REQUEST_SIZE_LIMIT = 1024 * 1024  # 1MB for example

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_email: str):
        await websocket.accept()
        self.active_connections[user_email] = websocket

    async def disconnect(self, user_email: str):
        self.active_connections.pop(user_email, None)

    async def broadcast(self, data, conversation_users: List[User]):
        for user in conversation_users:
            connection = self.active_connections.get(user.email)
            if connection:
                try:
                    await connection.send_text(data)
                except Exception as e:
                    self.active_connections.pop(user.email, None)


connection_manager = ConnectionManager()


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        keycloak_token: KeycloakToken = await get_keycloak_token_fallback(token)
        await connection_manager.connect(websocket, keycloak_token.email)
        await process_websocket_requests(websocket, keycloak_token)
    except ErrorMessageException as e:
        await send_error_message(websocket, str(e), keycloak_token, NotificationMessageType.ERROR)
    except Exception as e:
        logger.info("Exception: " + str(e))
        await websocket.close(code=1008)
        

async def send_error_message(websocket, errorMessage: str, keycloak_token: KeycloakToken, notification_type: NotificationMessageType = NotificationMessageType.ERROR):
    notification = {
        "type": notification_type.value,
        "error_mesage": errorMessage
    }
    await websocket.send_text(generate_websocket_response(notification, "notification", DateTimeEncoder, keycloak_token.email))


async def process_websocket_requests(websocket, keycloak_token):
    while True:
        try:
            data = await websocket.receive_text()
           
            if data == "ping":
                continue
            
            message = json.loads(data)
            action = message.get("action")

            if action == WebsocketAction.GET_CONVERSATIONS.value:
                await handle_get_conversations(websocket, keycloak_token)

            elif action == WebsocketAction.CREATE_AI_MESSAGE.value:
                await handle_create_ai_message(websocket, keycloak_token, message)

            elif action == WebsocketAction.CREATE_AI_CHAT_WITH_INIT_MESSAGE.value:
                await handle_create_chat_init_message(websocket, keycloak_token, message)

            elif action == WebsocketAction.ADD_USER_MESSAGE.value:
                await handle_add_user_message(websocket, keycloak_token, message)

            elif action == WebsocketAction.DELETE_CONVERSATION.value:
                await handle_delete_conversation(websocket, keycloak_token, message)

            elif action == WebsocketAction.GET_CONVERSATION_BY_ID.value:
                await handle_get_conversation_by_id(websocket, keycloak_token, message)

            elif action == WebsocketAction.ADD_USER_TO_MESSAGE.value:
                await handle_add_user_to_message(websocket, keycloak_token, message)

            elif action == WebsocketAction.REMOVE_USER_FROM_MESSAGE.value:
                await handle_remove_user_from_message(websocket, keycloak_token, message)

            elif action == WebsocketAction.SEARCH_USER.value:
                await handle_search_user(websocket, keycloak_token, message)

        except ErrorMessageException as e:
            await send_error_message(websocket, str(e), keycloak_token, NotificationMessageType.WARNING)

        except json.JSONDecodeError as e:
            await send_error_message(websocket, f"Invalid JSON received: {str(e)}", keycloak_token, NotificationMessageType.ERROR)

        except WebSocketDisconnect:
            logger.error("Websocket disconnected")
            break

        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}", exc_info=True)
            break


async def handle_add_user_to_message(websocket, keycloak_token, message):
    conversationId = message.get("conversationId")
    
    userToAdd = message.get("email")

    conversation_dict = add_user_service(
        keycloak_token, conversationId, userToAdd).dict()

    response = {
        "type": WebsocketAction.ADD_USER_TO_MESSAGE.value,
        "message": conversation_dict
    }
    
    if conversationId:
        currentConversation = get_user_conversation_by_id_service(
            conversationId)

    await connection_manager.broadcast(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email), currentConversation.users)

async def handle_create_ai_message(websocket, keycloak_token, message):
    logger.info(WebsocketAction.CREATE_AI_MESSAGE.value)

    conversationId = message.get("conversationId")
    gptModel = message.get("gptModel")
    chat_message = message.get("chatMessage")

    currentConversation = None
    if conversationId:
        currentConversation = get_user_conversation_by_id_service(
            conversationId)
    else:
        create_empty_conversation_service(keycloak_token)

    async for currentConversation in add_ai_message_service_streaming(currentConversation, chat_message, keycloak_token, conversationId, gptModel):
        response = {
            "type": WebsocketAction.CREATE_AI_MESSAGE.value,
            "message": currentConversation.dict()
        }

        await connection_manager.broadcast(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email), currentConversation.users)


async def handle_get_conversations(websocket, keycloak_token):
    logger.info(WebsocketAction.GET_CONVERSATIONS.value)
    conversations = get_user_conversations_by_email_service(keycloak_token)
    conversations_dicts = [conv.dict() for conv in conversations]

    response = {
        "type": WebsocketAction.GET_CONVERSATIONS.value,
        "message": conversations_dicts
    }

    await websocket.send_text(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email))


def generate_websocket_response(response, type: str, cls, userEmail: str):
    websocket_response = {
        "type": type,
        "websocket_message": response,
        "user": userEmail
    }
    return json.dumps(websocket_response, cls=cls)


async def handle_create_chat_init_message(websocket, keycloak_token, message):
    logger.info(WebsocketAction.CREATE_AI_CHAT_WITH_INIT_MESSAGE.value)

    gptModel = message.get("gptModel")
    chat_message = message.get("chatMessage")

    currentConversation = create_conversation_service(
        keycloak_token, chat_message, gptModel)
    conversation_dict = add_usermessage_service(
        currentConversation, chat_message, keycloak_token, currentConversation.id, gptModel).dict()

    response = {
        "type": WebsocketAction.CREATE_AI_CHAT_WITH_INIT_MESSAGE.value,
        "message": conversation_dict
    }

    await websocket.send_text(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email))


async def handle_add_user_message(websocket, keycloak_token, message):
    conversationId = message.get("conversationId")
    gptModel = message.get("gptModel")
    chat_message = message.get("chatMessage")

    currentConversation = None
    if conversationId:
        currentConversation = get_user_conversation_by_id_service(
            conversationId)
    else:
        create_empty_conversation_service(keycloak_token)

    conversation_dict = add_usermessage_service(
        currentConversation, chat_message, keycloak_token, conversationId, gptModel).dict()

    response = {
        "type": WebsocketAction.ADD_USER_MESSAGE.value,
        "message": conversation_dict
    }

    await websocket.send_text(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email))


async def handle_delete_conversation(websocket, keycloak_token, message):
    conversationId = message.get("conversationId")

    if conversationId:
        currentConversation = get_user_conversation_by_id_service(
            conversationId)

    conversations = delete_conversation_service(keycloak_token, conversationId)

    conversations_dicts = [conv.dict() for conv in conversations]

    response = {
        "type": WebsocketAction.DELETE_CONVERSATION.value,
        "message": conversations_dicts
    }

    await websocket.send_text(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email))
    await connection_manager.broadcast(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email), currentConversation.users)


async def handle_get_conversation_by_id(websocket, keycloak_token, message):
    conversationId = message.get("conversationId")
    conversation_dict = get_user_conversation_by_id_service(
        conversationId).dict()

    response = {
        "type": WebsocketAction.GET_CONVERSATION_BY_ID.value,
        "message": conversation_dict
    }

    await websocket.send_text(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email))


async def handle_search_user(websocket, keycloak_token, message):
    search_term = message.get("searchTerm")
    list = get_users_service(search_term)

    response = {
        "type": WebsocketAction.SEARCH_USER.value,
        "message": list
    }

    json.dumps(response, cls=PydanticEncoder)

    await websocket.send_text(generate_websocket_response(response, "broadcast", PydanticEncoder, keycloak_token.email))


async def handle_remove_user_from_message(websocket, keycloak_token, message):
    conversationId = message.get("conversationId")

    if conversationId:
        currentConversation = get_user_conversation_by_id_service(
            conversationId)

    userToDelete = message.get("email")
    conversation_dict = delete_user_service(
        conversationId, userToDelete).dict()

    response = {
        "type": WebsocketAction.REMOVE_USER_FROM_MESSAGE.value,
        "message": conversation_dict
    }

    await connection_manager.broadcast(generate_websocket_response(response, "broadcast", DateTimeEncoder, keycloak_token.email), currentConversation.users)


async def prevent_large_request_size(request: Request):
    body = await request.body()
    if len(body) > REQUEST_SIZE_LIMIT:
        raise HTTPException(status_code=413, detail="Payload too large")
