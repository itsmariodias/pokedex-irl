from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from pokedex.creature.models import Creature, CreatureCreate, CreatureUpdate


def create_creature(db: Session, creature: CreatureCreate) -> Creature:
    """
    Create a new creature in the database.

    Args:
        db (Session): Database session
        creature (CreatureCreate): The creature data to create

    Returns:
        Creature: The created creature

    Raises:
        HTTPException: If creature with same name already exists
    """
    db_creature = Creature.model_validate(creature)
    db.add(db_creature)
    try:
        db.commit()
        db.refresh(db_creature)
        return db_creature
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creature with this name already exists",
        )


def get_creature(db: Session, creature_id: int) -> Creature:
    """
    Get a creature by ID.

    Args:
        db (Session): Database session
        creature_id (int): The ID of the creature to retrieve

    Returns:
        Creature: The requested creature

    Raises:
        HTTPException: If creature is not found
    """
    creature = db.query(Creature).filter(Creature.id == creature_id).first()
    if not creature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Creature not found"
        )
    return creature


def get_all_creatures(db: Session, skip: int = 0, limit: int = 100) -> list[Creature]:
    """
    Get all creatures with pagination.

    Args:
        db (Session): Database session
        skip (int): Number of records to skip
        limit (int): Maximum number of records to return

    Returns:
        list[Creature]: List of creatures
    """
    return db.query(Creature).offset(skip).limit(limit).all()


def update_creature(
    db: Session, creature_id: int, creature_data: CreatureUpdate
) -> Creature:
    """
    Update a creature by ID.

    Args:
        db (Session): Database session
        creature_id (int): The ID of the creature to update
        creature_data (CreatureUpdate): The updated creature data

    Returns:
        Creature: The updated creature

    Raises:
        HTTPException: If creature is not found
    """
    creature = get_creature(db, creature_id)
    for key, value in creature_data.dict(exclude_unset=True).items():
        setattr(creature, key, value)

    db.commit()
    db.refresh(creature)
    return creature


def delete_creature(db: Session, creature_id: int) -> None:
    """
    Delete a creature by ID.

    Args:
        db (Session): Database session
        creature_id (int): The ID of the creature to delete

    Raises:
        HTTPException: If creature is not found
    """
    creature = get_creature(db, creature_id)
    db.delete(creature)
    db.commit()
