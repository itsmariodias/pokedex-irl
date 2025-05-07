from fastapi import UploadFile, HTTPException


async def validate_image(image: UploadFile) -> UploadFile:
    """
    Dependency to validate that an uploaded file is an image.

    Args:
        image: The uploaded file to validate

    Returns:
        UploadFile: The validated image file

    Raises:
        HTTPException: If the file is not an image
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    return image
