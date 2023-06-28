import uuid
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class UUIDModel(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid.uuid4().hex, description="Unique identifier")

class User(UUIDModel):
    firstName: Optional[str] = Field(None, description="User's first name")
    lastName: Optional[str] = Field(None, description="User's last name")
    shortName: Optional[str] = Field(None, description="User's short name")
    email: str = Field(..., description="User's email address")

class Origin(str, Enum):
    AI_ASSISTANT = "AI_ASSISTANT"
    USER = "USER"

class Message(UUIDModel):
    content: str = Field(..., description="Content of the message")
    origin: Origin = Field(..., description="Either 'AI_ASSISTANT' or 'USER'")
    owner: Optional[User]
    length: int = Field(..., description="Length of the message")
    model: Optional[str]
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Conversation(UUIDModel):
    firstName: Optional[str] = Field(None, description="User's first name")
    lastName: Optional[str] = Field(None, description="User's last name")
    uid: str = Field(..., description="User's unique identifier")
    owner: User
    blobs: Optional[List[Message]]
    conversationHeader: Optional[str] = Field("Conversation with GPT-3", description="Conversation header")
    topic: Optional[str] = Field(None, description="Topic of the conversation")
    users: Optional[List[User]]
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Updated timestamp")
