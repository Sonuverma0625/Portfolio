# Portfolio Backend

A Node.js Express REST API backend for the portfolio website, using a JSON flat-file database.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Installation & Run

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server (production)
npm start

# Start in dev mode with auto-reload (requires nodemon)
npm run dev
```

Server runs at: **http://localhost:3002**  
Frontend is served at: **http://localhost:3002** (root)  
API base: **http://localhost:3002/api**  
Admin Dashboard: **Open backend/admin.html in browser**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API info & available routes |
| GET | `/api/portfolio` | Portfolio owner info |
| GET | `/api/projects` | All projects (`?featured=true`, `?tag=React`) |
| GET | `/api/projects/:id` | Single project |
| GET | `/api/skills` | Skill categories |
| GET | `/api/certificates` | Certificates & awards |
| GET | `/api/experience` | Work experience |
| POST | `/api/contact` | Submit contact message |
| GET | `/api/messages` | View all messages (admin) |
| PUT | `/api/messages/:id/read` | Mark message as read |
| DELETE | `/api/messages/:id` | Delete a message |
| GET | `/api/analytics` | Site analytics |
| POST | `/api/analytics/visit` | Record a page visit |

---

## 📬 Contact Form API

**POST** `/api/contact`

```json
{
  "name": "Visitor",
  "email": "visitor@email.com",
  "subject": "Project Inquiry",
  "message": "Hello, I'd like to discuss a project..."
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Message received! I will get back to you soon.",
  "id": "uuid-here"
}
```

---

## 🗄️ Database

Data is stored in `backend/db.json` (flat-file, no external DB required).

To reset the database to default seed data:
```bash
npm run seed
```

---

## 📁 Folder Structure

```
portfolio/
├── index.html          ← Frontend (served by backend at /)
├── style.css           ← Styles
├── script.js           ← Frontend JS
└── backend/
    ├── server.js       ← Express API server
    ├── db.json         ← JSON flat-file database
    ├── admin.html      ← Admin dashboard
    ├── package.json    ← Dependencies
    └── scripts/
        └── seed.js     ← Database seed script
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` folder (optional):

```env
PORT=3002
```
