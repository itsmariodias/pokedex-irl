from enum import Enum
from functools import cache

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from pokedex.config import settings


class ModelName(Enum):
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    QWEN_3_LOCAL = "qwen-3-local"
    GEMMA_3_LOCAL = "gemma-3-local"


@cache
def get_llm(model_name: str) -> BaseChatModel:
    """
    Placeholder function to get the LLM instance.
    In a real implementation, this would return an instance of the LLM based on the model name.
    """

    if model_name not in [m.value for m in ModelName]:
        raise ValueError(f"Invalid model name: {model_name}")

    model = ModelName(model_name)

    match model:
        case ModelName.GPT_4O:
            pass
        case ModelName.GPT_4O_MINI:
            pass
        case ModelName.QWEN_3_LOCAL:
            llm = ChatOpenAI(
                name=settings.model_name,
                model="gpt-4o-mini",
                api_key=SecretStr(settings.model_api_key),
                base_url=settings.model_endpoint,
                temperature=0.0,
                max_tokens=512,
            )
        case ModelName.GEMMA_3_LOCAL:
            llm = ChatOpenAI(
                name=settings.image_model_name,
                model="gpt-4o-mini",
                api_key=SecretStr(settings.image_model_api_key),
                base_url=settings.image_model_endpoint,
                temperature=0.0,
                max_tokens=512,
            )

    return llm
