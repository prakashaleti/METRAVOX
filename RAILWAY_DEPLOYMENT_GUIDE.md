# METRAVOX Railway Deployment Guide (with PostgreSQL Database)

This step-by-step guide will walk you through deploying **METRAVOX** (Django REST API + React Single Page App) onto **[Railway](https://railway.app)** with a managed **Railway PostgreSQL Database**.

---

## 1. What Has Been Configured For Railway

Your project is already 100% production-ready for Railway:
- **Multi-stage Dockerfile (`Dockerfile`)**: Automatically builds the React frontend with Node.js and packages the Django backend with Python 3.11 + Gunicorn.
- **PostgreSQL Connection (`settings.py`)**: Configured with `dj-database-url` and `psycopg2-binary` to automatically detect Railway's `DATABASE_URL`.
- **Static Asset Engine (`WhiteNoise`)**: Pre-configured with cache headers and hashing for instant static file delivery without external S3 buckets.
- **Container Entrypoint (`backend/entrypoint.sh`)**: Automatically runs `migrate`, provisions initial system credentials, runs `collectstatic`, and boots Gunicorn on Railway's dynamic `$PORT`.
- **Safe Default Personas (`ensure_initial_users`)**: Ensures applicant, officer, and admin accounts exist in the fresh PostgreSQL database on startup.
- **Root `.gitignore` & `railway.json`**: Pre-configured build specifications and exclusions.

---

## 2. Deployment Method A: Deploy via GitHub (Recommended)

### Step 1: Initialize Git and Push to GitHub

Open a terminal in `d:\metra` (PowerShell or Command Prompt) and run:

```bash
# 1. Initialize git repository
git init

# 2. Stage all files (node_modules and local sqlite are excluded by .gitignore)
git add .

# 3. Create initial deployment commit
git commit -m "Prepare METRAVOX for Railway production deployment"

# 4. Set main branch
git branch -M main

# 5. Connect to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

### Step 2: Create a New Project on Railway

1. Go to **[railway.app](https://railway.app)** and log in (or sign up with GitHub).
2. On your Dashboard, click **"+ New Project"**.

---

### Step 3: Add the PostgreSQL Database Service

1. In the project creation menu, select **"Provision PostgreSQL"** (or click **"+ New" -> "Database" -> "Add PostgreSQL"**).
2. Railway will instantly provision a dedicated PostgreSQL database container.
3. This automatically creates an internal connection string called `DATABASE_URL`.

---

### Step 4: Deploy METRAVOX from Your GitHub Repository

1. In the same project canvas, click **"+ New"** (or **"Create Service"**).
2. Select **"GitHub Repo"**.
3. Choose the repository you pushed in **Step 1**.
4. Railway will automatically detect the root `Dockerfile` and start the build process.

---

### Step 5: Connect Web Service to PostgreSQL Database

1. Click on your **METRAVOX Web Service** in the Railway canvas.
2. Navigate to the **"Variables"** tab.
3. Click **"Add Reference"** (or **"New Variable"**).
4. Select `DATABASE_URL` from the PostgreSQL service.
   - It will look like: `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
5. Add the following additional production variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-references the Railway PostgreSQL database |
| `SECRET_KEY` | `metravox-production-secret-key-2026-gov` | Production Django secret key |
| `DEBUG` | `False` | Disables debug mode for maximum security |
| `ALLOWED_HOSTS` | `*` | Allows traffic from your Railway domain |

---

### Step 6: Generate a Public Domain

1. In your Web Service, click the **"Settings"** tab.
2. Scroll to the **"Networking"** section.
3. Click **"Generate Domain"** (e.g. `metravox-production.up.railway.app`).
4. Click the generated URL to open your live application!

---

## 3. Deployment Method B: Deploy via Railway CLI (Fast Terminal Deploy)

If you have Node.js installed and prefer deploying directly from your command line without GitHub:

```bash
# 1. Install the Railway CLI
npm i -g @railway/cli

# 2. Authenticate
railway login

# 3. Initialize project
railway init

# 4. Provision PostgreSQL in this project
railway add --database postgres

# 5. Deploy current directory
railway up

# 6. Generate domain
railway domain
```

---

## 4. Default Production Personas

Once your application deploys, the database entrypoint will automatically initialize the 3 statutory METRAVOX personas in PostgreSQL:

1. **Applicant / Trader**:
   - Email: `prakash01.aleti@gmail.com`
   - Password: `Applicant@2026`
   - Role: Trader / Commercial Applicant

2. **Senior Legal Metrology Officer**:
   - Email: `ramesh.varma.lmo@gov.in`
   - Password: `Officer@2026`
   - Role: Enforcement Authority

3. **State Administrator**:
   - Email: `rohith.admin@gov.in`
   - Password: `Admin@2026`
   - Role: Directorate State Admin

---

## 5. How to Monitor Logs & Verify on Railway

1. In Railway, click on the Web service and select the **"Deployments"** tab.
2. Click on the active deployment to view **Build Logs** and **Deploy Logs**.
3. You should see:
   ```
   ==> Running METRAVOX Database Migrations...
   ==> Verifying Default System Personas...
   METRAVOX initial users verified successfully.
   ==> Collecting Static Assets...
   ==> Starting Gunicorn Production Server on port 8000...
   [INFO] Starting gunicorn 21.2.0
   [INFO] Listening at: http://0.0.0.0:8000
   ```
4. Open the generated domain in any web browser and you can begin testing!

