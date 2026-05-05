# 🕰️ Digital Time Capsule

A full-stack MERN application that allows users to create, seal, and schedule digital memories to be delivered to themselves or others at a future date.

![Digital Time Capsule Preview](https://res.cloudinary.com/demo/image/upload/v1625121234/sample-capsule.jpg)

## ✨ Features

*   **🔒 Secure Time-Locking**: Messages are immutable once "Sealed" and remain hidden until the chosen unlock date.
*   **🎨 Premium UI**: Built with a sleek glassmorphism aesthetic using Tailwind CSS v4 and Lucide icons.
*   **📂 Multimedia Support**: Attach photos, videos, and audio files to your memories via Cloudinary.
*   **🤖 Automated Delivery**: Background scheduler (node-cron) handles delivery via email (SendGrid) and in-app notifications.
*   **🔄 Recurring Memories**: Option to clone capsules for yearly delivery.
*   **🔐 Robust Auth**: JWT-based authentication with Access/Refresh tokens and protected routes.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Zustand (State), Tailwind CSS v4, Lucide Icons.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB + Mongoose.
*   **Services**: Cloudinary (Media), SendGrid (Email).
*   **Scheduling**: node-cron.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/Sarvan-12/future-message.git
cd future-message
```

Install dependencies for all folders:
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Environment Variables
Create a `.env` file in the `server` directory:
```text
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
SENDGRID_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 4. Run the App
From the root directory:
```bash
npm run dev
```
*   Frontend: `http://localhost:5173`
*   Backend: `http://localhost:5000`

---

## 📄 License
MIT License - feel free to use this for your own projects!
