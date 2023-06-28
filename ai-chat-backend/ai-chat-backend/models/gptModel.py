import os
from enum import Enum
from typing import Optional
from pydantic import BaseSettings

# Define a BaseSettings class to handle environment variables
class Settings(BaseSettings):
    AZURE_GPT_3_5_MODEL_EU_CLOUDMELTER: Optional[str] = os.getenv("AZURE_GPT_3_5_MODEL_EU_CLOUDMELTER")

# Instantiate a settings object to be used throughout your app
settings = Settings()

# Enum to represent the GPT Models
class GptModel(Enum):
    GPT_3_5 = settings.AZURE_GPT_3_5_MODEL_EU_CLOUDMELTER
    GPT_4 = 'GPT_4'
