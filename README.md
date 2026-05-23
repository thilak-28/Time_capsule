# Future Message — Digital Time Capsule

> Compose a message. Seal it in time. Deliver it exactly when it matters.

A full-stack **MERN** application that lets users create, seal, and schedule digital memories — delivered automatically to any email inbox at a precise future date.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/zap.svg" width="20" height="20" /> Features

- <img src="https://unpkg.com/lucide-static@latest/icons/lock.svg" width="14" height="14" /> **Secure Time-Locking** — Messages are sealed and hidden until the chosen unlock date.
- <img src="https://unpkg.com/lucide-static@latest/icons/mail.svg" width="14" height="14" /> **Real Email Delivery** — Powered by the Brevo API; emails land in real inboxes automatically.
- <img src="https://unpkg.com/lucide-static@latest/icons/bell.svg" width="14" height="14" /> **In-App Notifications** — Bell icon alerts when a capsule is delivered.
- <img src="https://unpkg.com/lucide-static@latest/icons/sparkles.svg" width="14" height="14" /> **Premium UI** — Glassmorphism aesthetic built with Tailwind CSS v4 and Lucide Icons.
- <img src="https://unpkg.com/lucide-static@latest/icons/paperclip.svg" width="14" height="14" /> **Multimedia Support** — Attach photos, videos, and audio via Cloudinary.
- <img src="https://unpkg.com/lucide-static@latest/icons/clock.svg" width="14" height="14" /> **Automated Scheduler** — Background cron job checks every minute and triggers delivery.
- <img src="https://unpkg.com/lucide-static@latest/icons/shield-check.svg" width="14" height="14" /> **JWT Auth** — Secure login and signup with Access and Refresh token management.
- <img src="https://unpkg.com/lucide-static@latest/icons/users.svg" width="14" height="14" /> **Multiple Recipients** — Send a capsule to multiple email addresses at once.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/workflow.svg" width="20" height="20" /> How it Works

The application follows a precise lifecycle to guarantee delivery at the intended time.

```
[Draft] -> [Sealed] -> [MongoDB] -> [node-cron Scanner] -> [Brevo API] -> [Inbox]
```

| Stage | Description |
|:---|:---|
| **Draft** | User composes a message and optionally attaches media. Saved as a mutable draft. |
| **Sealed** | User locks the capsule. Content becomes immutable and is hidden from all parties until the unlock date. |
| **MongoDB** | The sealed capsule is persisted with its unlock timestamp and recipient list. |
| **node-cron Scanner** | A background process runs every minute, querying the database for any capsule whose unlock date has passed. |
| **Brevo API** | For each due capsule, the server calls the Brevo REST API to dispatch the email to all recipients. |
| **Inbox** | Recipients receive the capsule content directly in their email inbox. An in-app notification is simultaneously created. |

### Authentication

The app uses a dual-token JWT strategy for secure session management:

- **Access Token** — Short-lived (15 minutes). Sent with every authenticated API request.
- **Refresh Token** — Long-lived (7 days). Stored securely and used only to issue a new access token when the current one expires.

This ensures that even if an access token is intercepted, its exposure window is minimal.

> **Note on Local Development:** Delivery runs on your local server. Keep `npm run dev` running for emails to be sent on schedule. If the server was offline when a capsule was due, it will catch up and send all pending emails immediately on the next restart.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/layers.svg" width="20" height="20" /> Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React (Vite), Zustand, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Email Delivery | Brevo REST API |
| Media Uploads | Cloudinary |
| Scheduling | node-cron |

---

## <img src="https://unpkg.com/lucide-static@latest/icons/terminal.svg" width="20" height="20" /> Getting Started

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

## <img src="https://unpkg.com/lucide-static@latest/icons/send.svg" width="20" height="20" /> How to Test Email Delivery

1. Sign up and log in to the app.
2. Click **"New Capsule"**.
3. Write a message.
4. Add a recipient email (e.g., a friend's Gmail).
5. Set the **Unlock Date** to **2 minutes from now**.
6. Select **Delivery Mode: Both** (Email + In-App).
7. Click **"Seal Capsule"**.
8. Wait 2 minutes — a real email will land in that inbox.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/folder-tree.svg" width="20" height="20" /> Project Structure

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

## <img src="https://unpkg.com/lucide-static@latest/icons/wrench.svg" width="20" height="20" /> Troubleshooting

| Problem | Solution |
|:---|:---|
| `MongoDB connection failed` | Make sure the MongoDB service is running locally. |
| `BREVO SERVICE Loaded: No` | Verify that `server/.env` exists and contains a valid `SMTP_PASS`. |
| Email not received | Check the spam folder. Confirm your Brevo API key starts with `xkeysib-`. |
| Port 5000 in use | Set `PORT=5001` in your `.env` file. |

---

## <img src="https://unpkg.com/lucide-static@latest/icons/git-pull-request.svg" width="20" height="20" /> Contributing

Contributions are welcome. Please follow these conventions to keep the codebase consistent:

- **Branch naming** — Use a prefix that reflects the change type: `feat/your-feature`, `fix/bug-description`, `docs/what-you-updated`.
- **Commit messages** — Follow the Conventional Commits format: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`. Keep the subject line under 72 characters.
- **Pull Requests** — Open a PR against `main`. Include a short description of what changed and why. Reference any related issue numbers.
- **Code style** — Match the existing patterns in the file you are editing. Do not introduce new dependencies without discussion.
- **Testing** — If your change affects the cron scheduler or email delivery logic, verify end-to-end locally before submitting.

---

## <img src="https://unpkg.com/lucide-static@latest/icons/file-text.svg" width="20" height="20" /> License

MIT License — free to fork, modify, and build upon.

---

Created by [Sarvan Salian](https://github.com/Sarvan-12)
