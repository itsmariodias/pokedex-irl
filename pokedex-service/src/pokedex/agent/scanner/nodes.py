import base64

from langchain_core.language_models import BaseChatModel
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import HumanMessage
from loguru import logger

from pokedex.agent.scanner.schema import CreatureName, ScannerState, IsCreatureState


async def analyze_image(state: ScannerState, config: RunnableConfig) -> ScannerState:
    image = state.image
    if not image:
        raise ValueError("No image provided")

    base64_image = base64.b64encode(image).decode("utf-8")

    prompt = """
    You are an expert zoologist. Look at the image and identify the creature shown. 
    If the image contains a clearly visible animal or living being, respond with its common name, such as "African Lion", "Red Kangaroo", or "Chimpanzee".
    """

    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": prompt,
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{base64_image}",
                },
            },
        ]
    )

    llm: BaseChatModel = config["configurable"].get("llm")
    structured_llm = llm.with_structured_output(CreatureName)

    logger.debug("Sending image to LLM...")
    response: CreatureName = await structured_llm.ainvoke([message])

    logger.debug(f"LLM response: {response}")

    return {"creature_name": response.name, "image": image}


async def verify_creature(state: ScannerState, config: RunnableConfig) -> ScannerState:
    creature_name = state.creature_name

    prompt = f"Is {creature_name} an animal or sea creature?"

    llm: BaseChatModel = config["configurable"].get("llm")
    structured_llm = llm.with_structured_output(IsCreatureState)

    logger.debug(f"Verifying creature {creature_name} with LLM...")
    response: IsCreatureState = await structured_llm.ainvoke(prompt)
    logger.debug(f"LLM verification response: {response}")

    if not response.is_creature:
        state.creature_name = None

    return state
