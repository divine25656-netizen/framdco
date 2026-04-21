# Framd.co — Portfolio Website

## Stack
- Frontend: HTML/CSS/JS (bold animated portfolio)
- Backend: Node.js + Express
- Database: SQL.js (SQLite, zero config)

## Setup & Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

3. Open browser: `http://localhost:3000`
4. Admin dashboard: `http://localhost:3000/admin`
   - Password: Divine2026.

## Deploy to Render (Free)
1. Push this folder to a GitHub repo
2. Go to render.com → New Web Service
3. Connect your repo
4. Build command: `npm install`
5. Start command: `node server.js`
6. Done — your site is live!

## File Structure
```
framdco/
├── server.js          ← Express backend + API routes
├── package.json
└── public/
    ├── index.html     ← Main portfolio site
    └── admin.html     ← Admin dashboard
```

## API Endpoints
- POST /api/inquiry — Submit contact form
- POST /api/admin/login — Admin login
- GET /api/admin/inquiries — Get all inquiries
- PATCH /api/admin/inquiries/:id/read — Mark as read
- DELETE /api/admin/inquiries/:id — Delete inquiry
- GET /api/admin/stats — Get stats
