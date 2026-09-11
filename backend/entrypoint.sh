#!/bin/bash
set -e

echo "==> Running METRAVOX Database Migrations..."
python manage.py migrate --noinput

echo "==> Verifying Default System Personas..."
python manage.py ensure_initial_users

echo "==> Collecting Static Assets..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn Production Server on port ${PORT:-8000}..."
exec gunicorn metravox_core.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
