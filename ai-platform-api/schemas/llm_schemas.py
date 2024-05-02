from enum import Enum
from typing import Optional

from pydantic import BaseModel


class ReqChatBase(BaseModel):
    system_prompt: Optional[str] = None
    assistant_prompt: Optional[str] = None
    user_prompt: str
    stream: Optional[bool] = False
    model: str
    max_tokens: Optional[int] = None
    temperature: Optional[float] = 0.6


class LLMTypeEnum(str, Enum):
    GEMINI = "gemini"
    GROQ = "groq"
    AOAI = "aoai"


class ReqChat(ReqChatBase):
    llm_type: LLMTypeEnum


class FormattedModel(BaseModel):
    model: str
    deployment_id: str
    version: Optional[str]


class ResModels(BaseModel):
    models: dict[LLMTypeEnum, list[FormattedModel]]
