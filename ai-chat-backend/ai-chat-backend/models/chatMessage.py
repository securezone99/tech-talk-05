from pydantic import BaseModel, Field
from typing import Optional

class ChatMessage(BaseModel):
    chat_message: Optional[str] = Field(None, min_length=1, description="The content of the chat message")
