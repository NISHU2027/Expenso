# 💰 Expenso — Smart Expense Tracker

A full-stack **MERN** (MongoDB, Express, React, Node.js) application that helps users track, categorize, and analyze their personal expenses in real time. Built with a focus on clean UX, secure authentication, and insightful data visualization to help users make smarter financial decisions.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react)
![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render)
![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)

### 🔗 [Live Demo] https://expenso-frontend-xfpu.onrender.com

---

## 📖 Overview

**Expense** is a smart expense tracking web application designed to give users a clear, real-time picture of their spending habits. Users can add, edit, and delete transactions, organize them by category, set monthly budgets, and view interactive charts that break down where their money is going — all through a fast, responsive interface.

The app follows a modern MERN architecture with a RESTful API backend, JWT-based authentication, and a React frontend that communicates with the backend via secure, protected routes.

---

## ✨ Features

- 🔐 **User Authentication** — Secure signup/login using JWT and hashed passwords (bcrypt)
- 💸 **Expense Management (CRUD)** — Add, edit, delete, and view expenses instantly
- 🗂️ **Categories & Tags** — Organize expenses into categories (Food, Travel, Bills, etc.)
- 📊 **Analytics Dashboard** — Visual breakdown of spending via charts (pie/bar/line graphs)
- 📅 **Date-wise & Monthly Filtering** — View expenses by day, week, month, or custom range
- 🎯 **Budget Tracking** — Set monthly budget limits with alerts when nearing/exceeding limits
- 🔍 **Search & Filter** — Quickly find transactions by category, amount, or date
- 📱 **Responsive UI** — Fully responsive design for mobile, tablet, and desktop
- 🌙 **Dark/Light Mode** — Toggle between themes for comfortable viewing
- 📤 **Export Data** — Download expense history as CSV/PDF for record-keeping
- ⚡ **Real-time Updates** — Instant UI updates without page reloads

> *Feel free to trim/expand this list to match the exact features you've implemented.*

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Hooks, Context API / Redux)
- React Router
- Axios
- Chart.js / Recharts
- Tailwind CSS / Bootstrap / Material UI

**Backend:**
- Node.js
- Express.js
- JWT for authentication
- bcrypt.js for password hashing

**Database:**
- MongoDB
- Mongoose ODM

**Deployment:**
- Frontend: [Render](https://render.com)
- Backend/API: [Render](https://render.com)
- Database: [MongoDB Atlas](https://www.mongodb.com/atlas)

**Other Tools:**
- Postman (API testing)
- Git & GitHub (version control)
- dotenv (environment variables)

---

## 🏗️ Architecture

```
Client (React) ⇄ REST API (Express/Node) ⇄ MongoDB (Mongoose)
```

- The frontend sends HTTP requests to the backend via Axios.
- Express handles routing, middleware (auth, validation), and business logic.
- Mongoose models define schemas for Users, Expenses, and Categories.
- JWT tokens are issued on login and verified on protected routes.

---

## 📁 Folder Structure

```
Expense/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/        # Axios API calls
│       ├── App.js
│       └── index.js
│
├── server/                 # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── .env
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint                | Description                  | Auth Required |
|--------|--------------------------|-------------------------------|----------------|
| POST   | `/api/auth/register`    | Register a new user           | ❌ |
| POST   | `/api/auth/login`       | Login and receive JWT token   | ❌ |
| GET    | `/api/expenses`         | Get all expenses for user     | ✅ |
| POST   | `/api/expenses`         | Add a new expense              | ✅ |
| PUT    | `/api/expenses/:id`     | Update an existing expense     | ✅ |
| DELETE | `/api/expenses/:id`     | Delete an expense               | ✅ |
| GET    | `/api/categories`       | Get all categories              | ✅ |
| GET    | `/api/analytics`        | Get spending summary/analytics | ✅ |

> *Update this table to reflect your actual routes.*

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Expense.git
cd Expense
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Run the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
npm start
```

The app should now be running at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## ☁️ Deployment

This project is deployed using **Render** for both the frontend and backend, with **MongoDB Atlas** as the database.

### Backend (Render Web Service)
1. Push your `server` code to GitHub.
2. On Render, create a new **Web Service** and connect your repo.
3. Set the root directory to `server` (if using a monorepo).
4. Build command: `npm install`
5. Start command: `npm start` (or `node server.js`)
6. Add environment variables in Render's dashboard:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → your secret key
   - `PORT` → Render auto-assigns this, but keep it in `.env` for local dev

### Frontend (Render Static Site / Web Service)
1. Set the root directory to `client`.
2. Build command: `npm install && npm run build`
3. Publish directory: `build`
4. Add an environment variable pointing to your deployed backend URL:
   - `REACT_APP_API_URL` → `https://your-backend-name.onrender.com`

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Whitelist Render's IP (or allow access from anywhere: `0.0.0.0/0` for simplicity).
3. Copy the connection string into your backend's `MONGO_URI` environment variable.

> ⚠️ Note: Free-tier Render services spin down after inactivity, so the first request after idle time may take 30–50 seconds to respond.


## 🚀 Future Improvements

- [ ] Multi-currency support
- [ ] Recurring expense automation
- [ ] Shared/group expense splitting
- [ ] AI-based spending predictions
- [ ] Email/SMS budget alerts
- [ ] Mobile app version (React Native)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add some feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---



⭐ If you found this project helpful, consider giving it a star on GitHub!
