from typing import Optional

from pydantic_settings import BaseSettings


class SQL_ALCHEMY_SETTINGS(BaseSettings):
    SQLALCHEMY_DATABASE_URL: str
    SQLALCHEMY_ECHO: Optional[bool] = False


class GEMINI_SETTINGS(BaseSettings):
    GEMINI_API_KEY: Optional[str] = ""


class AOAI_SETTINGS(BaseSettings):
    AOAI_API_KEY: Optional[str] = ""


class Env(GEMINI_SETTINGS, AOAI_SETTINGS, SQL_ALCHEMY_SETTINGS):
    class Config:
        env_file = ".env"
        extra = "ignore"


env = Env()
