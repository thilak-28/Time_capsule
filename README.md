# Future Message — Digital Time Capsule

> Send a message to your future self, or someone you love. Lock it in time. Deliver it when it matters most.

A full-stack **MERN** application that allows users to create, seal, and schedule digital memories — delivered automatically to any email inbox at a future date via real email delivery.

---

## Features

- **Secure Time-Locking** — Messages are sealed and hidden until the chosen unlock date.
- **Real Email Delivery** — Powered by the Brevo API, emails land in real inboxes automatically.
- **In-App Notifications** — Bell icon alerts when a capsule is delivered.
- **Premium UI** — Glassmorphism aesthetic built with Tailwind CSS v4 and Lucide Icons.
- **Multimedia Support** — Attach photos, videos, and audio via Cloudinary.
- **Automated Scheduler** — Background cron job checks every minute and triggers delivery.
- **JWT Auth** — Secure login/signup with Access & Refresh tokens.
- **Multiple Recipients** — Send your capsule to multiple email addresses at once.

---

## How it Works

The Digital Time Capsule follows a precise lifecycle to ensure your memories are delivered exactly when you intended.

1. **Creation**: Compose your message and attach media. This is saved as a **Draft**.
2. **Sealing**: Once you "Seal" a capsule, its content becomes immutable. It is now time-locked and cannot be opened by anyone (including you) until the unlock date.
3. **Background Monitoring**: The server runs a background process (Cron Job) every minute. It scans the database for any sealed capsules whose unlock date has passed.
4. **Delivery**: When a capsule reaches its unlock time, the server automatically:
    - Sends the content to all recipient inboxes via the Brevo API.
    - Creates an in-app notification for the recipients.
    - Marks the capsule as "Delivered."

> **Note on Local Development**: Since the delivery logic runs on your computer, the server (`npm run dev`) must be active for emails to be sent. If your computer is off at the exact unlock time, the server will catch up and send all "missed" emails as soon as you restart it.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Zustand, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Email Delivery | Brevo REST API |
| Media Uploads | Cloudinary |
| Scheduling | node-cron |

---

## Getting Started

Follow these steps carefully to run the project locally with your own email sender.

### Step 1: Prerequisites

Make sure you have these installed:
- [Node.js v18+](https://nodejs.org/en/download) — Download the LTS version
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) — For local database
- [Git](https://git-scm.com/downloads) — To clone the repo

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/Sarvan-12/future-message.git
cd future-message
```

---

### Step 3: Install Dependencies

**Windows (PowerShell / CMD) — run each line separately:**
```bash
npm install
cd server
npm install
cd ..
cd client
npm install
cd ..
```

**Mac / Linux — can run as one block:**
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

---

### Step 4: Get Your Free API Keys

You need accounts on three platforms. All are free.

#### A) Brevo (For Email Delivery)
> This is the service that sends real emails from your app.

1. Sign up for free at: [https://app.brevo.com/account/register](https://app.brevo.com/account/register)
2. Verify your email address.
3. Once logged in, go to: [https://app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)
4. Click **"Generate a new API key"**
5. Name it anything (e.g., `TimeCapsule`) and click **Generate**.
6. **Copy the key** — it starts with `xkeysib-...`

> **Note**: The Brevo Free Plan provides 300 emails/day for free. No credit card is required.

---

#### B) Cloudinary (For Image/Video Uploads) — OPTIONAL
> **Skip this if you only want text capsules and email delivery.** The app works perfectly without it.
> Only needed if you want to attach photos, videos, or audio to capsules.

1. Sign up for free at: [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. After logging in, go to your **Dashboard**: [https://console.cloudinary.com/](https://console.cloudinary.com/)
3. You will see your **Cloud Name**, **API Key**, and **API Secret** right on the dashboard.
4. Copy all three.

> If you skip this, just leave the `CLOUDINARY_*` fields blank in your `.env` — everything else still works.

---

#### C) MongoDB (Database)
> Option 1 (Recommended for local): Use the local MongoDB you installed in Step 1.
> Your connection string will be: `mongodb://localhost:27017/capsule`

> Option 2 (Cloud): Use **MongoDB Atlas** for free at: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
> After creating a cluster, click **Connect** and copy your connection string.

---

### Step 5: Create Your `.env` File

Inside the `server/` folder, create a new file called `.env` (no extension):

```bash
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://localhost:27017/capsule

# JWT Secrets
# Generate these using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run that command TWICE — use one for ACCESS and one for REFRESH
JWT_ACCESS_SECRET=paste_your_generated_secret_here
JWT_REFRESH_SECRET=paste_your_other_generated_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Settings (Brevo API)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=xkeysib-your-brevo-api-key-here
EMAIL_FROM=your_gmail@gmail.com

# Cloudinary Settings (OPTIONAL — only for media uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **How to generate JWT Secrets**: Open any terminal and run this command **twice** to get two unique secrets:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copy the first output into `JWT_ACCESS_SECRET` and the second into `JWT_REFRESH_SECRET`.

---

### Step 6: Run the App

From the **root** directory:

```bash
npm run dev
```

You should see:
```text
[0] BREVO SERVICE Loaded: Yes (your@email.com)
[0] Server running on port 5000
[0] MongoDB Connected: localhost
[1] VITE ready — http://localhost:5173
```

Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## How to Test Email Delivery

1. Sign up and log in to the app.
2. Click **"New Capsule"**.
3. Write a message.
4. Add a recipient email (e.g., a friend's Gmail).
5. Set the **Unlock Date** to **2 minutes from now**.
6. Select **Delivery Mode: Both** (Email + In-App).
7. Click **"Seal Capsule"**.
8. Wait 2 minutes — a real email will land in that inbox.

---

## Project Structure

```text
future-message/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── store/
├── server/          # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── utils/
│   │   └── sendEmail.js   # Brevo API email logic
│   └── server.js
└── package.json     # Root scripts
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `MongoDB connection failed` | Make sure MongoDB service is running locally |
| `BREVO SERVICE Loaded: No` | Check your `server/.env` file exists and has `SMTP_PASS` |
| Email not received | Check spam folder; verify your Brevo API key starts with `xkeysib-` |
| Port 5000 in use | Change `PORT=5001` in your `.env` |

---

## License

MIT License — feel free to fork, modify, and build on this project!

---

Created by [Sarvan Salian](https://github.com/Sarvan-12)
