from functools import lru_cache
import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class for application configuration.
    Uses Pydantic BaseSettings to handle environment variables with type validation.
    """

    model_config = SettingsConfigDict(env_file=".env", env_nested_delimiter="__")

    # API Configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Pokedex Service"
    project_description: str = "Pokedex Service API"
    port: int = 8000
    debug: bool = False
    database_url: str = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '../../pokedex.db'))}"
    static_dir: str = "/static"
    upload_dir: str = "/uploads"
    default_model: str = "qwen-3-local"
    model_name: str
    model_api_key: str
    model_endpoint: str
    image_model_name: str
    image_model_endpoint: str
    image_model_api_key: str


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached instance of the Settings class.

    Returns:
        Settings: Application configuration settings.
    """
    return Settings()


settings = get_settings()
