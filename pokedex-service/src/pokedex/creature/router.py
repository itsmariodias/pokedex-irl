from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile

from pokedex.config import Settings, get_settings
from pokedex.database import DbSession

from .dependencies import validate_image
from .models import CreaturePublic
from .service import identify_from_image


router = APIRouter(prefix="/creature", tags=["creature-identification"])


@router.post(
    "/identify",
    response_model=CreaturePublic,
    responses={
        400: {
            "description": "Bad Request",
            "content": {
                "application/json": {"example": {"detail": "File must be an image"}}
            },
        }
    },
)
async def identify_creature(
    db_session: DbSession,
    settings: Annotated[Settings, Depends(get_settings)],
    image: Annotated[UploadFile, Depends(validate_image)],
):
    """
    Endpoint to identify a creature from an uploaded image.

    Args:
        db_session: Database session
        settings: Application settings
        image: The validated image file

    Returns:
        Details of the identified creature
    """

    creature = await identify_from_image(db_session, settings, image)
    return creature
