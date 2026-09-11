# ==============================================================================
# Multi-stage Dockerfile for METRAVOX
# Combines React Vite Frontend + Django REST API Backend in a single production container
# ==============================================================================

# ── Stage 1: Build React Frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Django Backend & Production Runtime ──────────────────────────────
FROM python:3.11-slim

# System packages for PostgreSQL (psycopg2), image processing (Pillow), etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend codebase
COPY backend/ ./backend/

# Copy built frontend dist from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

# Convert line endings and make entrypoint executable
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
