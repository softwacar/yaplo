<div align="center">

<img src="https://raw.githubusercontent.com/softwacar/yaplo/main/frontend/public/favicon.svg" width="80" height="80" alt="Yaplo Logo" />

# Yaplo

**A modern, full-stack task management SaaS application**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://docker.com)

</div>

---

## 📸 Screenshots

| Dashboard (Light) | Dashboard (Dark) |
|---|---|
| ![Dashboard Light](screenshots/3.png) | ![Dashboard Dark](screenshots/7.png) |

| Board View | Card Detail |
|---|---|
| ![Board](screenshots/4.png) | ![Card Modal](screenshots/5.png) |

| Login | Create Board |
|---|---|
| ![Login](screenshots/1.png) | ![Create Board](screenshots/8.png) |

---

## ✨ Features

- 🔐 **JWT Authentication** — Access tokens (15min) + refresh tokens (7 days) in httpOnly cookies
- 📋 **Board Management** — Create boards with custom colors or Unsplash background photos
- 📝 **List & Card System** — Organize work with lists and cards inside boards
- 🖱️ **Drag & Drop** — Reorder and move cards between lists seamlessly
- 🌙 **Dark Mode** — Persistent dark/light theme preference
- 📅 **Due Dates** — Color-coded badges (overdue, due today, upcoming)
- 🔍 **Search** — Real-time board search
- 👤 **Profile Management** — Update name, password, and profile photo
- 🖼️ **Unsplash Integration** — Beautiful background photos for boards
- 📱 **Responsive Design** — Works on desktop and mobile
- ⚡ **Loading Skeletons** — Smooth loading states
- 🔔 **Toast Notifications** — Real-time feedback for all actions

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| @dnd-kit | Drag and drop |
| react-hot-toast | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| Prisma ORM | Database ORM |
| PostgreSQL | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Docker Compose | Development environment |

---

## 🏗️ Architecture

```
yaplo/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── board.controller.js
│   │   │   ├── list.controller.js
│   │   │   └── card.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── board.routes.js
│   │   │   ├── list.routes.js
│   │   │   └── card.routes.js
│   │   └── utils/
│   │       ├── db.js
│   │       └── jwt.js
│   └── prisma/
│       └── schema.prisma
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── CardModal.jsx
        │   ├── ConfirmModal.jsx
        │   ├── Logo.jsx
        │   └── Skeleton.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── pages/
        │   ├── Board.jsx
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── Profile.jsx
        │   └── Register.jsx
        └── utils/
            └── dateHelpers.js
```

---

## 🗄️ Database Schema

```
User
 ├── Board[]
 │    └── List[]
 │         └── Card[]
 └── RefreshToken[]
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Docker & Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/softwacar/yaplo.git
cd yaplo
```

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Setup the backend

```bash
cd backend
npm install
```

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://yaplo_user:yaplo_password@localhost:5433/yaplo_db"
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

### 4. Setup the frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env` file:

```env
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

Start the development server:

```bash
npm run dev
```

### 5. Open the app

```
http://localhost:5173
```

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Boards

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards` | Get all boards |
| GET | `/api/boards/:id` | Get single board with lists & cards |
| POST | `/api/boards` | Create board |
| PUT | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |

### Lists

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards/:boardId/lists` | Get all lists |
| POST | `/api/boards/:boardId/lists` | Create list |
| PUT | `/api/boards/:boardId/lists/:id` | Update list |
| DELETE | `/api/boards/:boardId/lists/:id` | Delete list |

### Cards

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards/:boardId/lists/:listId/cards` | Get all cards |
| POST | `/api/boards/:boardId/lists/:listId/cards` | Create card |
| PUT | `/api/boards/:boardId/lists/:listId/cards/:id` | Update card |
| DELETE | `/api/boards/:boardId/lists/:listId/cards/:id` | Delete card |

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Access tokens expire in **15 minutes**
- Refresh tokens stored in **httpOnly cookies** (XSS protection)
- Refresh tokens stored in **database** for revocation on logout
- All endpoints verify **user ownership** before any operation
- **Helmet.js** for secure HTTP headers
- **CORS** configured for frontend origin only

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/softwacar">softwacar</a>
</div>
