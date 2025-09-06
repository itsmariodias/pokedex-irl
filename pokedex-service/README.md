# Pokedex Service

Backend service for the PokeDex IRL project that identifies real-world creatures and generates Pokédex-style entries.

## Features

- Image upload and validation
- Creature identification API
- CRUD operations for creature data
- SQLite database storage
- FastAPI-based REST API
- Modular agent system for advanced reasoning and explanations
- Agents implemented via LangGraph for scanning and explaining creatures
- Extensible architecture for new agent types

## Tech Stack

- Python 3.12+
- FastAPI
- SQLModel/SQLAlchemy
- SQLite
- Pydantic
- Uvicorn
- LangGraph (agents)
- OpenAI (LLM integration)

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
    ├── config.py            # Application configuration
    ├── database.py          # Database setup and sessions
    ├── llm.py               # LLM integration (OpenAI)
    ├── main.py              # FastAPI application setup
    ├── agent/               # Modular agent system (LangGraph)
    │   ├── agents.py        # Agent registry and orchestration
    │   ├── explainer/       # Explainer agent (LangGraph)
    │   │   ├── agent.py     # Explainer agent logic
    │   │   ├── nodes.py     # Explainer agent nodes
    │   │   └── schema.py    # Explainer agent schema
    │   └── scanner/         # Scanner agent (LangGraph)
    │       ├── agent.py     # Scanner agent logic
    │       ├── nodes.py     # Scanner agent nodes
    │       └── schema.py    # Scanner agent schema
    └── creature/            # Creature identification module
        ├── dependencies.py  # FastAPI dependencies
        ├── enums.py         # Creature enums
        ├── models.py        # Data models
        ├── router.py        # API routes
        ├── service.py       # Business logic
        ├── utils.py         # Helper functions
        ├── test_dependencies.py # Tests for dependencies
        ├── test_router.py       # Tests for API routes
        ├── test_service.py      # Tests for business logic
        ├── test_utils.py        # Tests for utils
```

## License

Apache License 2.0 - See LICENSE file for details