from loguru import logger
from fastapi import HTTPException, UploadFile
from langchain_core.runnables import RunnableConfig
from pokedex.agent.explainer.schema import CreatureExplanation
from sqlalchemy.orm import Session

from pokedex.creature.models import Creature, CreatureCreate, CreatureUpdate
from pokedex.creature.utils import upload_file
from pokedex.agent.agents import get_agent


def create(db_session: Session, creature: CreatureCreate) -> Creature:
    """
    Create a new creature in the database.

    Args:
        db_session (Session): Database session
        creature (CreatureCreate): The creature data to create

    Returns:
        Creature: The created creature
    """
    db_creature = Creature.model_validate(creature)
    db_session.add(db_creature)
    try:
        db_session.commit()
        db_session.refresh(db_creature)
        return db_creature
    except Exception:
        logger.error("Failed to create creature")
        db_session.rollback()
        raise


def get(db_session: Session, creature_id: int) -> Creature:
    """
    Get a creature by ID.

    Args:
        db_session (Session): Database session
        creature_id (int): The ID of the creature to retrieve

    Returns:
        Creature: The requested creature
    """
    creature = db_session.get(Creature, creature_id)
    return creature


def get_all(db_session: Session) -> list[Creature]:
    """
    Get all creatures.

    Args:
        db_session (Session): Database session

    Returns:
        list[Creature]: List of all creatures
    """
    return db_session.query(Creature).all()


def get_all_with_pagination(
    db_session: Session, skip: int = 0, limit: int = 100
) -> list[Creature]:
    """
    Get all creatures with pagination.

    Args:
        db_session (Session): Database session
        skip (int): Number of records to skip
        limit (int): Maximum number of records to return

    Returns:
        list[Creature]: List of creatures
    """
    return db_session.query(Creature).offset(skip).limit(limit).all()


def update(
    db_session: Session, creature_id: int, creature_data: CreatureUpdate
) -> Creature:
    """
    Update a creature by ID.

    Args:
        db_session (Session): Database session
        creature_id (int): The ID of the creature to update
        creature_data (CreatureUpdate): The updated creature data

    Returns:
        Creature: The updated creature
    """
    creature = get(db_session, creature_id)
    for key, value in creature_data.model_dump(exclude_unset=True).items():
        setattr(creature, key, value)

    db_session.commit()
    db_session.refresh(creature)
    return creature


def delete(db_session: Session, creature_id: int) -> None:
    """
    Delete a creature by ID.

    Args:
        db_session (Session): Database session
        creature_id (int): The ID of the creature to delete
    """
    creature = get(db_session, creature_id)
    db_session.delete(creature)
    db_session.commit()


def get_by_name(db_session: Session, name: str) -> Creature | None:
    """
    Get a creature by its name.

    Args:
        db_session (Session): Database session
        name (str): The name of the creature to find

    Returns:
        Creature | None: The found creature or None if not found
    """
    return db_session.query(Creature).filter(Creature.name == name).first()


async def identify_from_image(
    db_session: Session,
    image: UploadFile,
    upload_dir: str,
    config: RunnableConfig,
) -> Creature:
    """
    Identify a creature from an image and add it to the database if it doesn't exist.

    Args:
        db_session (Session): Database session
        image (UploadFile): The uploaded image file
        upload_dir (str): Directory path where the file will be saved

    Returns:
        Creature: The created or existing creature
    """

    # Scan the image using the scanner agent
    scanner_agent = get_agent("scanner-agent")

    image_buffer = await image.read()

    # scanner_agent.ainvoke returns a dict, not a ScannerState instance
    scanner_result = await scanner_agent.ainvoke({"image": image_buffer}, config)
    creature_name = scanner_result["creature_name"]

    if creature_name is None:
        raise HTTPException(
            status_code=400,
            detail="No creature found in the image. Please try again with a different image.",
        )

    # Check if the creature already exists
    existing_creature = get_by_name(db_session, creature_name)

    if existing_creature:
        # If it exists, return the existing creature
        logger.info(
            f"Creature with name {creature_name} already exists. Returning existing creature."
        )
        return existing_creature

    # Save the image to the static directory
    await image.seek(0)
    file_path = await upload_file(image, upload_dir)

    explainer_agent = get_agent("explainer-agent")

    # Get the creature details from the explainer agent
    creature_details = await explainer_agent.ainvoke({"creature_name": creature_name}, config)

    creature_details: CreatureExplanation = creature_details["creature"]

    # Create a new Creature object
    creature = CreatureCreate(
        name=creature_name,
        scientific_name=creature_details.scientific_name,
        description=creature_details.description,
        type=creature_details.pokemon_type,
        gender_ratio=creature_details.gender_ratio,
        kingdom=creature_details.kingdom,
        classification=creature_details.classification,
        family=creature_details.family,
        height=creature_details.height,
        weight=creature_details.weight,
        body_shape=creature_details.body_shape,
        image_path=file_path,
    )

    logger.info(f"Adding new creature to the database: {creature.model_dump()}")

    # If it doesn't exist, create a new one and return it
    return create(db_session, creature)
