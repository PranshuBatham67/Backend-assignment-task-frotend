# TaskMaster Frontend

A modern, responsive frontend for the TaskMaster application, built with **React**, **Vite**, and **Tailwind CSS**.

## 🚀 Key Features

- **Modern UI:** Clean, responsive design using Tailwind CSS.
- **Authentication:** Secure login, registration, and session management.
- **Protected Routes:** Dashboard access restricted to authenticated users.
- **Task Management:** Create, view, update, and delete tasks.
- **Password Reset:** OTP-based forgot password flow.
- **Real-time Feedback:** Toast notifications and loading states.

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** Heroicons
- **Notifications:** React Toastify
- **State Management:** Context API (AuthContext)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

## ⚡ Installation & Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify API Configuration:**
   - The API base URL is configured in `src/services/api.js`.
   - Default: `http://localhost:8000/api`
## 🏃‍♂️ Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at: `http://localhost:5173` (or 5174 if port is busy).

## 🧭 Application Routes

### Public Pages

| Path | Component | Description |
| :--- | :--- | :--- |
| `/login` | `Login` | User login page with credentials |
| `/register` | `Register` | New user registration page |
| `/forgot-password` | `ForgotPassword` | Request OTP and reset password |

### Protected Pages (Requires Login)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `Dashboard` | Main dashboard displaying task list |

### 🔄 Redirects

- Accessing root `/` without login redirects to `/login`.
- Accessing `/login` while logged in redirects to `/`.
- Unknown routes redirect to `/`.

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components (Navbar, etc.)
├── context/         # React Context (AuthContext)
├── pages/           # Page components (Login, Dashboard, etc.)
├── services/        # API service modules
│   ├── api.js       # Axios configuration
│   ├── authService.js
│   ├── taskService.js
│   └── passwordResetService.js
├── App.jsx          # Main Router configuration
└── main.jsx         # Entry point
```


