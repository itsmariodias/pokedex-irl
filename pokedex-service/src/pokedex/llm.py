from enum import Enum
from functools import cache

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI
from pydantic import SecretStr


class ModelName(Enum):
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    QWEN_3_LOCAL = "qwen-3-local"
    GEMMA_3_LOCAL = "gemma-3-local"


@cache
def get_llm(model_name: str, endpoint: str, api_key: SecretStr) -> BaseChatModel:
    """
    Returns a language model instance based on the specified model name.
    Args:
        model_name (str): The name of the model to retrieve.
        endpoint (str): The API endpoint for the model.
        api_key (SecretStr): The API key for authentication.
    Returns:
        BaseChatModel: An instance of the requested language model.
    """

    if model_name not in [m.value for m in ModelName]:
        raise ValueError(f"Invalid model name: {model_name}")

    model = ModelName(model_name)

    match model:
        case ModelName.GPT_4O: #TODO test openAi model
            llm = ChatOpenAI(
                name=model_name,
                model="gpt-4o",
                api_key=api_key,
                base_url=endpoint,
                temperature=0.0,
                max_tokens=512,
            )
        case ModelName.GPT_4O_MINI | ModelName.QWEN_3_LOCAL | ModelName.GEMMA_3_LOCAL:
            llm = ChatOpenAI(
                name=model_name,
                model="gpt-4o-mini",
                api_key=api_key,
                base_url=endpoint,
                temperature=0.0,
                max_tokens=512,
            )

    return llm
