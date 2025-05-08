import os
from uuid import uuid1

from loguru import logger
from fastapi import UploadFile


async def upload_file(image: UploadFile, upload_dir: str) -> str:
    """
    Save an uploaded file to the storage directory.

    Args:
        image (UploadFile): The uploaded file
        upload_dir (str): Directory path where the file will be saved

    Returns:
        str: The path where the file was saved

    Raises:
        IOError: If there's an error reading the file or writing to disk
    """
    try:
        # Read the file content
        contents = await image.read()

        _, file_extension = os.path.splitext(image.filename)
        file_path = os.path.join(upload_dir, str(uuid1()) + file_extension)

        # Ensure upload directory exists
        os.makedirs(upload_dir, exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(contents)

        return file_path

    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise IOError(f"Failed to upload file: {str(e)}") from e
