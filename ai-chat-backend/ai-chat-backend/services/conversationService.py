import asyncio
import os
import re
from typing import List
from fastapi import WebSocket

#from api.routes.conversationController import send_error_message
from utils.errorHandlingException import ErrorMessageException
import openai
from datetime import datetime
from models.conversation import Conversation, User, Message
from models.keycloak.keycloakToken import KeycloakToken
from models.chatMessage import ChatMessage
from services.repository.conversationRepository import *
from services.shared.gptEnvironmentVariables import setOpenAIEuEnvironmentVariable
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Multithreading
import functools
from concurrent.futures import ThreadPoolExecutor

# Load environment variables
load_dotenv()

executor = ThreadPoolExecutor(max_workers=100)  # You can adjust this value based on your needs


def get_user_conversation_by_id_service(conversationId: str) -> str:
    return get_conversation_by_id(conversationId)


def get_all_conversations_service() -> List[Conversation]:
    return get_conversations()


def add_user_service(keycloak_token, conversationId: str, userToAdd: str) -> Conversation:

    # Verify the new email is a valid email address with a country code
    if not re.match(r"[^@]+@[^@]+\.([a-z]{2}\.)?pwc\.com$", userToAdd):
        raise ErrorMessageException("Invalid email address. Email must be a PwC email address like @de.pwc.com")

    conversation = get_conversation_by_id(conversationId)

    # Verify the new email is not already in the conversation
    for user in conversation.users:
        if user.email == userToAdd:
            raise ErrorMessageException(
                "Email already added")

    user: User = extract_name_from_email(userToAdd)
    conversation.users.append(user)

    return update_conversation(conversationId, conversation)


def extract_name_from_email(email: str):
    local_part = email.split('@')[0]
    parts = local_part.split('.')

    # If there are more than two parts, only consider the first two
    if len(parts) > 2:
        first_name, surname = parts[0], parts[1]
    else:
        first_name, surname = parts

    shortName = first_name[0].capitalize() + surname[0].capitalize()
    user: User = User(email=email, firstName=first_name.capitalize(
    ), lastName=surname.capitalize(), shortName=shortName)
    return user


def create_conversation_service(keycloak_token: KeycloakToken, chatMessage: ChatMessage, gptModel: str) -> Conversation:
    setOpenAIEuEnvironmentVariable()

    response = openai.ChatCompletion.create(
        engine=os.getenv("AZURE_GPT_3_5_MODEL_EU_CLOUDMELTER"),
        messages=[{"role": "system", "content": "Provide a Headline of the users text that captures its main idea and only use 5 Word as maximum and don't add any line breaks. Dont start the Headline with quotes and if only one word is provided use this word as the Headline! "}, {
            "role": "user", "content": "Provide a Headline of the following text that captures its main idea and only use 5 Word as maximum and don't add any line breaks. Only output the Headline and nothing else!      \n  \nText: " + chatMessage}],
        temperature=0.7,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)

    user: User = extract_name_from_email(keycloak_token.email)
    summary = response.choices[0].message.content.replace('"', '')
    conversation = Conversation(
        uid=keycloak_token.uid, owner=user, blobs=[], users=[], topic=summary)
    conversation.users.append(user)

    return create_conversation(conversation)


def get_user_conversations_by_email_service(keycloak_token: KeycloakToken) -> str:
    return get_conversations_by_email(keycloak_token.email)


def create_empty_conversation_service(keycloak_token: KeycloakToken) -> Conversation:
    conversation = Conversation(uid=keycloak_token.uid, topic="empty")
    return create_conversation(conversation)


def delete_conversation_service(keycloak_token: KeycloakToken, conversationId: str) -> str:
    currentConversation = get_conversation_by_id(conversationId)

    if (currentConversation.owner.email != keycloak_token.email):
        raise ErrorMessageException(
            "You are not the owner of this conversation")

    delete_conversation(conversationId)
    get_conversations_by_uid(keycloak_token.uid)

    return get_conversations_by_uid(keycloak_token.uid)


def delete_user_service(conversationId: str, userToDelete: str) -> Conversation:
    conversation = get_conversation_by_id(conversationId)
    if (conversation.owner.email == userToDelete):
        raise ErrorMessageException(
            "You are not allowed to delete the owner of this conversation")

    for user in conversation.users:
        if user.email == userToDelete:
            conversation.users.remove(user)
            return update_conversation(conversationId, conversation)


def add_usermessage_service(currentConversation: Conversation, interactionTerm: str, keycloak_token: KeycloakToken, conversationId: str, gptModel: str = None) -> str:

    if keycloak_token.email not in [user.email for user in currentConversation.users]:
        raise ErrorMessageException(
            "You are not a member of this conversation")

    if (currentConversation.blobs == None):
        currentConversation.blobs = []
        currentConversation.topic = interactionTerm[:20]

    user: User = extract_name_from_email(keycloak_token.email)

    userMessage: Message = Message(
        model=gptModel, content=interactionTerm, origin="USER", owner=user, length=len(interactionTerm))
    currentConversation.blobs.append(userMessage)

    aiUser: User = User(email="ai.assistant@pwc.com",
                        firstName=gptModel.upper(), lastName="", shortName="AI")

    aiMessage: Message = Message(model=gptModel, content="", origin="AI_ASSISTANT", length=len(
        ""), owner=aiUser, timestamp=datetime.utcnow())
    currentConversation.blobs.append(aiMessage)
    update_conversation(conversationId, currentConversation)

    return currentConversation


def build_message_from_last_blobs(currentConversation: Conversation) -> str:
    # # Initialize the message with the last content in the blobs
    messageHistory = ""

    # Start from the second last blob
    index = -2

    # If there the initial blob
    if len(currentConversation.blobs) == 2:
        messageHistory = currentConversation.blobs[0].content
        return messageHistory

    # Continue appending previous messages while the total length is less than X characters
    while len(messageHistory) < 1000 and abs(index) <= len(currentConversation.blobs):
        messageHistory = currentConversation.blobs[index].content + \
            ' ' + messageHistory
        index -= 1

    # Return the resulting message
    return messageHistory

def make_openai_request(engine, messages, temperature, max_tokens, top_p, frequency_penalty, presence_penalty, stop, stream):
    return openai.ChatCompletion.create(
        engine=engine,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=top_p,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
        stop=stop,
        stream=stream)
    

async def add_ai_message_service(currentConversation: Conversation, chat_message: str, keycloak_token: KeycloakToken, conversationId: str, gptModel: str = None):
    setOpenAIEuEnvironmentVariable()
    if (currentConversation.blobs != []):
        messageHistory = build_message_from_last_blobs(currentConversation)
        if len(messageHistory) > 1000:
            messageHistory = messageHistory[-1000:]
    try:
        print("Start AI Request")
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(executor, functools.partial(
            make_openai_request,
            engine=os.getenv("AZURE_GPT_3_5_MODEL_EU_CLOUDMELTER"),
            messages=[{"role": "system", "content": "You are an AI assistant that helps people find information."}, {
                "role": "user", "content": messageHistory}],
            temperature=0.5,
            max_tokens=4000,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
            stream=False))
        print("End AI Request")
    except asyncio.TimeoutError:
        raise ErrorMessageException("OpenAI Limit has been reached please try again in a few minutes")


    currentConversation = get_conversation_by_id(conversationId)
    message = response["choices"][0]["message"]["content"]

    if currentConversation.blobs is None:
        currentConversation.blobs = []
        currentConversation.topic = chat_message[:20]

    currentConversation = get_conversation_by_id(conversationId)
    lastChat: Message = currentConversation.blobs[-1]
    lastChat.content = message
    lastChat.length = len(message)
    update_conversation(conversationId, currentConversation)
    return currentConversation


async def add_ai_message_service_streaming(currentConversation: Conversation, chat_message: str, keycloak_token: KeycloakToken, conversationId: str, gptModel: str = None):
    setOpenAIEuEnvironmentVariable()

    if currentConversation.blobs != []:
        messageHistory = build_message_from_last_blobs(currentConversation)
        if len(messageHistory) > 1000:
            messageHistory = messageHistory[-1000:]

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(executor, functools.partial(
            openai.ChatCompletion.create,
            engine=os.getenv("AZURE_GPT_3_5_MODEL_EU_CLOUDMELTER"),
            messages=[{"role": "system", "content": "You are an AI assistant that helps people find information."}, {
                "role": "user", "content": messageHistory}],
            temperature=0.5,
            max_tokens=4000,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None,
            stream=True))

    entireResponse = []
    word_counter = 0
    messageBuffer: str = ""
    content_found = False
    currentConversation = get_conversation_by_id(conversationId)

    for line in response:
        if "content" in line["choices"][0].delta:
            current_response = line["choices"][0].delta.content
            lastChat: Message = currentConversation.blobs[-1]
            messageBuffer += current_response
            currentConversation.blobs[-1].content = messageBuffer
            word_counter += len(current_response.split())  
            content_found = True
            entireResponse.append(current_response)
            if word_counter >= 2:
                yield currentConversation
                word_counter = 0

        elif content_found:
            yield currentConversation
            break

    response_text = ''.join(entireResponse)

    if currentConversation.blobs is None:
        currentConversation.blobs = []
        currentConversation.topic = chat_message[:20]

    currentConversation = get_conversation_by_id(conversationId)
    lastChat: Message = currentConversation.blobs[-1]
    lastChat.content = response_text
    lastChat.length = len(response_text)
    update_conversation(conversationId, currentConversation)


def delete_message_service(keycloak_token: KeycloakToken, conversationId: str, messageId: str) -> Conversation:
    conversation = get_conversation_by_id(conversationId)
    for message in conversation.blobs:
        if message.id == messageId:
            conversation.blobs.remove(message)
            update_conversation(conversationId, conversation)
            return conversation
    return conversation


def check_old_conversations():
    print("Checking for old conversations...")
    cutoff_date = datetime.utcnow() - timedelta(days=int(os.getenv("CHAT_DELETION_TIME")))

    all_conversations = get_all_conversations_service()

    for conversation in all_conversations:
        if conversation.updated_at < cutoff_date:
            print(f"Conversation {conversation.id} is older than" +
                  int(os.getenv("CHAT_DELETION_TIME")) + " days!")
            delete_conversation(conversation.id)
