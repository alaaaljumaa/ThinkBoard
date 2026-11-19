# 📝 ThinkBoard

A modern, full-stack note-taking application built with the **MERN stack**
(**M**ongoDB, **E**xpress, **R**eact, **N**ode.js), focused on clean UX,
security, and production-grade error handling.

ThinkBoard lets users create, view, edit, and delete notes through a fast,
responsive interface. The backend enforces validation, rate limiting, and
proper HTTP semantics, while the frontend delivers a smooth experience with
optimistic UI updates, toast notifications, and seamless dark mode.

---

## ✨ Features

### Core
- 📋 **Full CRUD** — Create, read, update, and delete notes
- 🔍 **Note details page** — View a single note with created/updated timestamps
- ✅ **Completion toggle** — Mark notes as done / undone
- 📱 **Fully responsive** — Optimized for mobile, tablet, and desktop

### UX & Design
- 🌙 **Dark mode** — System-aware with `localStorage` persistence (no flash on load)
- 🔔 **Toast notifications** — Elegant feedback for every action
- ⚡ **Optimistic UI** — Instant feedback on delete/update, with automatic rollback on failure
- 🎨 **Modern UI** — Tailwind CSS + daisyUI with gradients and smooth transitions
- ♿ **Accessible** — Keyboard navigation, ARIA labels, focus states

### Backend & Security
- 🛡️ **Rate limiting** — Protects the API using Upstash Redis
- ✔️ **Schema validation** — Mongoose enforces field constraints
- 🔁 **Proper HTTP semantics** — 200 / 201 / 400 / 404 / 429 / 500 with descriptive messages
- 🧯 **Centralized error handling** — CastError, ValidationError, and 429 handled consistently
- 🌐 **CORS configured** — Restricted to trusted origins

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (Hooks, Context API)
- Vite
- Tailwind CSS + daisyUI
- React Router v6
- react-hot-toast
- lucide-react

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Upstash Redis (rate limiting)
- dotenv

**Tools**
- npm
- nodemon
- Postman

---

## 🏗️ Architecture

- **RESTful API** — `/api/notes` with standard HTTP verbs
- **Modular structure** — Separated `controllers/`, `models/`, `routes/`, `middleware/`
- **Middleware chain** — CORS → JSON parser → Rate limiter → Routes → Error handler
- **Environment-driven** — All secrets and configs in `.env` (never committed)
- **Optimistic updates** — Frontend updates state before the server responds, reverting on error

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Upstash Redis account (for rate limiting)

### Installation

```bash
# 1) Clone the repo
git clone https://github.com/your-username/mern-thinkboard.git
cd mern-thinkboard

# 2) Backend setup
cd backend
npm install
cp .env.example .env      # fill in your values
npm run dev

# 3) Frontend setup (in a new terminal)
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev
```

### Environment Variables

**`backend/.env`**
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/notesdb
CLIENT_URL=http://localhost:5173
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 📡 API Endpoints

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | `/api/notes`        | Get all notes            |
| GET    | `/api/notes/:id`    | Get a single note        |
| POST   | `/api/notes`        | Create a new note        |
| PUT    | `/api/notes/:id`    | Update an existing note  |
| DELETE | `/api/notes/:id`    | Delete a note            |

---

## 📸 Screenshots

_Add screenshots here: Home (light/dark), Create Page, Note Details, Rate Limit Banner._

---

## 🔮 Roadmap

- 🔐 User authentication (JWT + refresh tokens)
- 📄 Pagination and search
- 🏷️ Tags and categories
- 🌍 Internationalization (Arabic / English)
- 🧪 Unit and integration tests (Jest + Supertest)
- 🐳 Docker + CI/CD pipeline

---

## 📄 License

MIT © [Your Name]
