from functools import lru_cache
import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings class for application configuration.
    Uses Pydantic BaseSettings to handle environment variables with type validation.
    """
    model_config = SettingsConfigDict(env_nested_delimiter='__')

    # API Configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Pokedex Service"
    project_description: str = "Pokedex Service API"
    debug: bool = False
    database_url: str = "sqlite:///:memory:"
    static_dir: str = "/Users/mariodias/Projects/pokedex-irl/static"
    upload_dir: str = os.path.join(static_dir, "uploads")


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached instance of the Settings class.

    Returns:
        Settings: Application configuration settings.
    """
    return Settings()
