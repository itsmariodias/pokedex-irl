# pokedex-irl

PokeDex IRL identifies real-world animals, insects, and sea life from images and generates fun, Pokédex-style entries using AI and LangChain agents.

## Features
- Upload images of animals, insects, or sea life and get instant identification.
- Generates creative Pokédex-style entries using AI.
- Uses LangChain agents for explanation and scanning.
- Modern web UI and REST API backend.

## Project Structure
- `pokedex-service/` — Python FastAPI backend, AI/LLM logic, database, and API endpoints
- `pokedex-ui/` — Vite/React TypeScript frontend

## Technologies Used
- Python 3.12, FastAPI, SQLAlchemy
- LangChain, OpenAI (or compatible LLM)
- React, TypeScript, Vite

## Installation

### Backend
```bash
cd pokedex-service
python -m venv venv
source venv/bin/activate
pip install -r pyproject.toml
uvicorn src.pokedex.main:app --reload
```

### Frontend
```bash
cd pokedex-ui
npm install
npm run dev
```

## Usage
1. Start the backend and frontend servers as above.
2. Open the frontend in your browser (default: http://localhost:5173).
3. Upload an image to receive a Pokédex-style entry.

## License
MIT
