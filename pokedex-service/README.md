# Pokedex Service

Backend service for the PokeDex IRL project that identifies real-world creatures and generates Pokédex-style entries.

## Features

- Image upload and validation
- Creature identification API
- CRUD operations for creature data
- SQLite database storage
- FastAPI-based REST API

## Tech Stack

- Python 3.12+
- FastAPI
- SQLModel/SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create required directories:
```bash
mkdir -p static/uploads
```

4. Run the development server:
```bash
uvicorn pokedex.main:app --reload
```

## API Documentation

Once running, access the API documentation at:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Project Structure

```
src/
└── pokedex/
    ├── config.py         # Application configuration
    ├── database.py       # Database setup and sessions
    ├── main.py          # FastAPI application setup
    └── creature/         # Creature identification module
        ├── dependencies.py  # FastAPI dependencies
        ├── models.py       # Data models
        ├── router.py       # API routes
        ├── service.py      # Business logic
        └── utils.py        # Helper functions
```

## License

Apache License 2.0 - See LICENSE file for details