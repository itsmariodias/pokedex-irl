#!/bin/bash
set -e

# Start uvicorn in the background
uvicorn pokedex.main:app --host 127.0.0.1 --port 8000 &
UVICORN_PID=$!

# Start nginx in foreground
nginx -g 'daemon off;'

# If nginx exits, stop uvicorn
kill $UVICORN_PID || true
