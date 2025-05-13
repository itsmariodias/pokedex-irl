from io import BytesIO
from unittest.mock import patch
from fastapi import UploadFile
import pytest

from .utils import upload_file


@pytest.fixture
def mock_valid_image():
    return UploadFile(
        filename="test.jpg",
        file=BytesIO(b"test_image_data"),
        headers={"content-type": "image/jpg"},
    )


@pytest.mark.asyncio
async def test_upload_file(mocker, mock_valid_image):
    """Test upload_file with a valid image"""
    mock_uuid1 = mocker.patch("pokedex.creature.utils.uuid1")
    mock_uuid1.return_value = "random_uuid"

    mock_make_dir = mocker.patch("os.makedirs")
    mock_make_dir.return_value = None

    with patch("pokedex.creature.utils.open") as mock_open:
        mock_open.return_value = BytesIO()
        image_path = await upload_file(mock_valid_image, "upload/dir/")

    assert image_path == "upload/dir/random_uuid.jpg"
    mock_open.assert_called_once_with(image_path, "wb")


@pytest.mark.asyncio
async def test_upload_file_error(mocker, mock_valid_image):
    """Test upload_file with error during uploading"""
    mock_uuid1 = mocker.patch("pokedex.creature.utils.uuid1")
    mock_uuid1.return_value = "random_uuid"

    mock_make_dir = mocker.patch("os.makedirs")
    mock_make_dir.return_value = None

    with pytest.raises(IOError) as exc_info:
        with patch("pokedex.creature.utils.open") as mock_open:
            mock_open.side_effect = Exception("Error uploading file")
            await upload_file(mock_valid_image, "upload/dir/")

    assert str(exc_info.value) == "Failed to upload file: Error uploading file"
