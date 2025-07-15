from langchain_core.runnables import RunnableConfig
from langchain_core.language_models import BaseChatModel
from loguru import logger

from pokedex.agent.explainer.schema import ExplainerState, CreatureExplanation


async def explain_creature(
    state: ExplainerState, config: RunnableConfig
) -> ExplainerState:
    llm: BaseChatModel = config["configurable"].get("llm")
    structured_llm = llm.with_structured_output(CreatureExplanation)

    prompt = f"""You are an expert zoologist. Provide a detailed explanation of the creature named '{state.creature_name}'.
Include its scientific name, description, type, gener ratio, kingdom, classification, family, height, weight, and body shape.
Provide the explanation as accurate and informative as possible.
"""

    response: CreatureExplanation = await structured_llm.ainvoke(prompt)

    logger.debug(f"Creature explanation: {response}")

    return {"creature": response}
