from langchain_core.runnables import RunnableConfig
from langchain_core.language_models import BaseChatModel
from loguru import logger

from pokedex.agent.explainer.schema import ExplainerState, CreatureExplanation


async def explain_creature(
    state: ExplainerState, config: RunnableConfig
) -> ExplainerState:
    llm: BaseChatModel = config["configurable"].get("llm")
    structured_llm = llm.with_structured_output(CreatureExplanation)

    prompt = f"""You are an expert zoologist and Pokemon enthusiast. Provide a detailed explanation of the creature named '{state.creature_name}' in 50 words or less.
Include its scientific name, description, gender ratio, kingdom, classification, family, height, weight, and body shape.
Provide the explanation as accurate as possible based on the constraints specified.
"""

    response: CreatureExplanation = await structured_llm.ainvoke(prompt)

    logger.debug(f"Creature explanation: {response}")

    return {"creature": response}
