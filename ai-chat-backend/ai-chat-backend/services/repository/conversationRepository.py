import os
from typing import List
from models.conversation import Conversation
from services.database.mongoDatabaseConection import get_gpt_database
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
collection_name = os.getenv("MONGODB_CHAT_PROJECT_NAME")

db = get_gpt_database()
collection = db[collection_name]


def create_conversation(conversation: Conversation) -> str:
    result = collection.insert_one(conversation.dict())
    return conversation


def get_conversations_by_uid(uid: str) -> List[Conversation]:
    results = collection.find({"uid": uid})
    conversations = [Conversation(
        **{**result, "_id": str(result["_id"])}) for result in results]
    return conversations


def get_conversation_by_id(conversationId: str) -> Conversation:
    result = collection.find_one({"id": conversationId})
    return Conversation(**{**result})


def get_conversation(conversationId: str) -> Conversation:
    result = collection.find_one({"id": conversationId})
    return result


def update_conversation(conversationId: str, conversation: Conversation) -> str:
    update_data = conversation.dict(by_alias=True, exclude={'_id'})
    result = collection.update_one(
        {"id": conversationId}, {"$set": update_data})
    if result.modified_count == 1:
        return conversation
    else:
        return f"Failed to update conversation with ID {conversationId}"


def delete_conversation(conversationId: str) -> str:
    result = collection.delete_one({"id": conversationId})
    if result.deleted_count == 1:
        return f"Deleted conversation with ID {conversationId}"
    else:
        return f"Failed to delete conversation with ID {conversationId}"


def get_conversations_by_email(email: str) -> List[Conversation]:
    results = collection.find({"users": {"$elemMatch": {"email": email}}})
    conversations = [Conversation(
        **{**result, "_id": str(result["_id"])}) for result in results]

    return conversations


def get_conversations() -> List[Conversation]:
    results = collection.find()
    conversations = [Conversation(
        **{**result, "_id": str(result["_id"])}) for result in results]
    return conversations
