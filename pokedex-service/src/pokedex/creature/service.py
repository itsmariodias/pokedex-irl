from loguru import logger
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .models import Creature, CreatureCreate, CreatureUpdate
from .utils import upload_file
from .enums import BodyShapeIcon


def create(db_session: Session, creature: CreatureCreate) -> Creature:
    """
    Create a new creature in the database.

    Args:
        db_session (Session): Database session
        creature (CreatureCreate): The creature data to create

    Returns:
        Creature: The created creature

    Raises:
        HTTPException: If creature with same name already exists
    """
    db_creature = Creature.model_validate(creature)
    db_session.add(db_creature)
    try:
        db_session.commit()
        db_session.refresh(db_creature)
        return db_creature
    except Exception:
        logger.error("Creature with this name already exists")
        db_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creature with this name already exists",
        )


def get(db_session: Session, creature_id: int) -> Creature:
    """
    Get a creature by ID.

    Args:
        db_session (Session): Database session
        creature_id (int): The ID of the creature to retrieve

    Returns:
        Creature: The requested creature

    Raises:
        HTTPException: If creature is not found
    """
    creature = db_session.get(Creature, creature_id)
    if not creature:
        logger.error(f"Creature with ID {creature_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Creature not found"
        )
    return creature


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

    Raises:
        HTTPException: If creature is not found
    """
    creature = get(db_session, creature_id)
    for key, value in creature_data.dict(exclude_unset=True).items():
        setattr(creature, key, value)

    db_session.commit()
    db_session.refresh(creature)
    return creature


def delete(db: Session, creature_id: int) -> None:
    """
    Delete a creature by ID.

    Args:
        db_session (Session): Database session
        creature_id (int): The ID of the creature to delete

    Raises:
        HTTPException: If creature is not found
    """
    creature = get(db, creature_id)
    db.delete(creature)
    db.commit()


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

    # Save the file to the static directory
    file_path = await upload_file(image, upload_dir)

    # Create a new Creature object
    creature = CreatureCreate(
        name="Red Kangaroo",
        scientific_name="Macropus rufus",
        description="The red kangaroo is the largest of all kangaroos and is native to Australia.",
        type="Normal/Fighting",
        gender_ratio=0.5,
        kingdom="Animalia",
        classification="Mammal",
        family="Macropodidae",
        height=1.5,
        weight=85.0,
        body_shape=BodyShapeIcon.BIPEDAL_TAIL,
        image_path=file_path,
    )

    # Check if the creature already exists
    existing_creature = get_by_name(db_session, creature.name)

    if existing_creature:
        # If it exists, return the existing creature
        logger.info(
            f"Creature with name {creature.name} already exists. Returning existing creature."
        )
        return existing_creature

    # If it doesn't exist, create a new one and return it
    return create(db_session, creature)
