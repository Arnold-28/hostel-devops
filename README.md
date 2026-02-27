# HostelOps – Production Deployment of a Containerized Complaint Management System

HostelOps replaces manual hostel complaint registers with a centralized digital platform.

This capstone focuses on **production-style DevOps deployment quality**:

- **Frontend:** React (Vite) → production build (`dist`) served by Nginx
- **Backend:** Node.js + Express + MongoDB + JWT
- **Reverse Proxy:** Nginx (single public entrypoint on **port 80**)
- **Orchestration:** Docker Compose (multi-container)

## 1) Folder structure

```
.
├── backend
│   ├── Dockerfile
│   ├── package.json
│   ├── .dockerignore
│   ├── .env.example
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── config
│       │   ├── db.js
│       │   └── bootstrapAdmin.js
│       ├── middleware
│       │   ├── auth.js
│       │   └── error.js
│       ├── models
│       │   ├── Complaint.js
│       │   └── User.js
│       ├── routes
│       │   ├── auth.js
│       │   └── complaints.js
│       └── utils
│           └── constants.js
├── frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .dockerignore
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── api.js
│       ├── auth.js
│       ├── components
│       │   ├── Nav.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages
│           ├── AdminDashboard.jsx
│           ├── StudentDashboard.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           └── NotFound.jsx
├── nginx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## 2) Step-by-step run instructions

Prereqs:

- Docker Desktop installed and running

Steps:

1. Create the environment file:

    - PowerShell: `Copy-Item .env.example .env`
    - CMD: `copy .env.example .env`

2. Build and start:

    - `docker compose up -d --build`

3. Open the app:

    - `http://localhost/`

4. Test health:

    - `http://localhost/api/health`

Stop:

- `docker compose down`

Logs:

- `docker compose logs -f --tail=200`

## 3) Architecture diagram (deployment)

<img width="6006" height="753" alt="MongoDB Data Persistence-2026-02-27-094240" src="https://github.com/user-attachments/assets/c060acf2-2e79-4af6-8cfc-7c56e12508bf" />


### Architecture explanation

- **Single public entrypoint**: only Nginx publishes port `80`.
- **Internal-only services**: backend and MongoDB have **no host port mappings** and communicate only via the Docker network.
- **Stateful restart safety**: MongoDB uses a named volume (`mongo_data`) for persistence.

## 4) Nginx configuration explanation

Nginx serves the React production build and reverse-proxies API calls.

- Static UI: `location / { try_files $uri $uri/ /index.html; }` ensures React Router SPA routing works.
- API routing: `location /api/ { proxy_pass http://backend:5000/api/; }` forwards requests to the backend service name on the internal Docker network.

Request flow:

Client → Nginx → Backend container → MongoDB

## 5) Dockerfile & container explanation

### Backend container (Node.js)

- Built from `node:20-alpine`
- Installs only production dependencies (`npm install --omit=dev`)
- Binds to `0.0.0.0:5000` inside the container
- Receives config via env vars (`MONGO_URI`, `JWT_SECRET`, ...)

### Nginx container (frontend + reverse proxy)

- Multi-stage build:
   - Stage 1 builds React (`npm run build`) producing `dist/`
   - Stage 2 serves `dist/` via Nginx and applies the reverse-proxy config

## 6) Networking & firewall strategy (ports)

Docker Compose port exposure:

- **Open to public:** `80/tcp` (Nginx)
- **Internal only:**
   - Backend `5000/tcp`
   - MongoDB `27017/tcp`

Host firewall guidance (what to demonstrate in report):

- Allow inbound `80/tcp` to the host.
- Deny/close inbound `5000/tcp` and `27017/tcp` on the host.
- Because Compose does not publish those ports, they are not reachable externally even before firewall rules.

## 7) Request lifecycle explanation

Example: student submits a complaint.

1. Browser sends `POST /api/complaints` to `http://<host>/` (same origin).
2. Nginx matches `location /api/` and proxies to `http://backend:5000/api/complaints`.
3. Backend validates JWT, validates request body, writes complaint to MongoDB.
4. Backend returns JSON response to Nginx.
5. Nginx returns response to the browser.

## 8) Debug checklist

- `docker compose ps` shows 3 containers (`nginx`, `backend`, `mongo`) up.
- Only one published port:
   - `docker compose ps` should show `0.0.0.0:80->80/tcp` only for Nginx.
- API health:
   - `curl http://localhost/api/health` → `{ "ok": true }`
- Backend can reach Mongo:
   - `docker compose logs backend --tail=200` should contain `connected to mongo`.
- Nginx proxy:
   - `docker compose logs nginx --tail=200` should show requests to `/api/...` with 200/401 responses.
- Auth:
   - Register a student via UI and verify student dashboard loads.
   - Admin user works only if `ADMIN_EMAIL`/`ADMIN_PASSWORD` are set in `.env`.

## 9) Serverful vs Serverless (short comparison)

- **Serverful (this project)**:
   - You manage containers, networking, and uptime.
   - Predictable long-running processes (Nginx, Node, Mongo).
   - Great for demonstrating reverse proxying, internal networks, and port exposure strategy.

- **Serverless (alternative)**:
   - Backend would run as functions (e.g., AWS Lambda) with API Gateway.
   - No container/host lifecycle to manage; scaling is automatic.
   - Mongo would typically be replaced by managed DB (or Atlas) and static frontend hosted via object storage + CDN.
   - Harder to demonstrate Nginx reverse proxy and container networking (which this spec requires).
