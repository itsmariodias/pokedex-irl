# Multi-stage Dockerfile for pokedex-irl

# Stage 1: build the frontend (Vite + React)
FROM node:18-alpine AS ui-builder
WORKDIR /app/ui
COPY pokedex-ui/ ./

# Indicate to the frontend that it's running in a containerized environment
# so it can set the correct API base URL for backend requests
ARG VITE_IN_CONTAINER=true
ENV VITE_IN_CONTAINER=$VITE_IN_CONTAINER

# Prefer lockfile install; fallback to npm install
RUN npm ci --silent || npm install --silent
RUN npm run build

# Stage 2: build Python wheelhouse for the backend
FROM python:3.12-slim AS py-builder
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libsqlite3-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# Ensure pip and build tools are up-to-date so build-system requirements
# (setuptools, wheel) can be satisfied when building wheels.
RUN python -m pip install --upgrade pip setuptools wheel
COPY pokedex-service/ ./service
WORKDIR /app/service
# Build wheels for the package and dependencies into /wheels
RUN pip wheel --no-cache-dir --wheel-dir /wheels .

# Stage 3: runtime image with nginx serving the frontend and Python running the backend
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx libsqlite3-0 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend package from the pre-built wheelhouse
COPY --from=py-builder /wheels /wheels
COPY --from=py-builder /app/service /app/service
# Install all wheels from the wheelhouse. Installing the pre-built wheels
# prevents pip from trying to build the package from source (which would
# require fetching build-system deps like setuptools). The shell wildcard
# installs wheels for the package and its dependencies that were produced
# in the py-builder stage.
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/*.whl

# Put the built frontend into nginx HTML dir
COPY --from=ui-builder /app/ui/dist /usr/share/nginx/html

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf \
       /etc/nginx/sites-enabled/default

# Nginx config and start script (startup script should launch nginx and the Python app)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Ensure runtime dirs exist
RUN mkdir -p /uploads /static

EXPOSE 80

CMD ["/start.sh"]
