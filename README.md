# 🚀 Skillify

Skillify is a full-stack freelancer network where people build career momentum by shipping real projects with the right team. 💼✨

**Tagline:** _Build your career by shipping real projects with the perfect team._

## 🌟 What the app does

Skillify helps two sides of the network:

- 👨‍💻 Freelancers create rich public profiles, discover opportunities, and apply to jobs.
- 🧑‍💼 Job posters publish openings, review incoming applications, and manage job status.

The platform is built around profile trust, verified accounts, and transparent application workflows. 🔐

## 🧩 Core capabilities

- 🔐 Secure auth: signup, login (HttpOnly cookies + token rotation), email verification, password reset
- 👥 Social integration: follow, unfollow, and remove-follower systems with "Follows You" badges
- 🧾 Guided profile completion with strict validation & completion status
- 👁️ Profile visibility controls (`public` / `private`)
- 📢 Job publishing with validation, dates, compensation, and optional job document upload
- 🔎 Job discovery with search and pagination
- 🔁 Application lifecycle: `pending`, `accepted`, `rejected`, `withdrawn`
- 📬 Sent and received application dashboards
- 🗑️ Account deletion flow via secure email confirmation link
- 💀 Skeletal loading states on profile pages for a premium, modern feel
- 📱 Mobile-optimized UI/UX across all pages with a slick drawer navigation
- 🔔 Rich global notifications (toast alerts) for errors, warnings, success, and info across all flows

## ⚠️ Important business rules

- Only users with a **public** profile can discover, apply to, or publish jobs.
- You **cannot switch to private** profile visibility if:
  - you have any **open posted jobs**, or
  - you have any **pending job applications**.
- Profile completeness requires key fields such as bio, location, profile picture, education, skills, GitHub URL, LinkedIn URL, and valid availability.

## 🛠️ Tech stack

### 🎨 Frontend

- React 19 + Vite
- React Router
- Tailwind CSS
- Context API (`AuthContext`, `ToastContext`)
- Framer Motion

### 🧠 Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Multer (memory storage uploads)
- Cloudinary (images/documents)
- Resend (email flows via HTTP API)
- Nodemailer (backup email service — Gmail SMTP)

## 🗂️ Repository structure

```text
Skiilify/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── vite.config.js
├── API_ROUTES.md
└── README.md
```

## 🔌 API overview

Base URL (local): `http://localhost:5000/api`

### Auth (`/auth`)

- `POST /signup`
- `POST /login`
- `POST /verify-email`
- `POST /resend-verification`
- `POST /check-verification`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /refresh`
- `POST /logout`
- `GET /me` (protected)

### Profile (`/profile`)

- `GET /discover`
- `GET /:userId`
- `PUT /update` (protected)
- `GET /me` (protected)
- `GET /status` (protected)
- `PUT /visibility` (protected)
- `POST /upload-picture` (protected)
- `POST /upload-resume` (protected)
- `POST /request-delete` (protected)
- `DELETE /delete` (protected)
- `POST /:userIdOrUsername/follow` (protected)
- `POST /:userIdOrUsername/unfollow` (protected)
- `POST /:userIdOrUsername/remove-follower` (protected)

### Jobs (`/jobs`)

- `POST /publish` (protected)
- `GET /discover` (protected)
- `GET /my-posts` (protected)
- `POST /:jobId/apply` (protected)
- `GET /applications/sent` (protected)
- `GET /applications/received` (protected)
- `PUT /applications/:applicationId/status` (protected)
- `PUT /:jobId/status` (protected)

For payloads and response details, see `API_ROUTES.md`. 📘

## 🧪 Local setup

### ✅ Prerequisites

- Node.js 18+
- MongoDB
- npm

### 1) 📥 Clone

```bash
git clone <repository-url>
cd Skiilify
```

### 2) ⚙️ Backend setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillify
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Email Configuration (Resend) - Currently Active
RESEND_API_KEY=your_resend_api_key

# Nodemailer Gmail SMTP (Backup - use with emailService_Nodemailer.js)
# EMAIL_USER=your-email@example.com
# EMAIL_PASS=your-gmail-app-password
# EMAIL_FROM=your-email@example.com

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run backend:

```bash
npm run dev
```

### 3) 🖥️ Frontend setup

```bash
cd ../Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 🧭 User flow summary

1. User signs up and verifies email.
2. User completes profile (required fields + files).
3. With public profile:
   - discover and apply to jobs, or
   - publish jobs and review applicants.
4. Manage application/job statuses from dashboard pages.

## 📧 Email service

Skillify uses **two email service files**:

| File | Transport | When to use |
|------|-----------|-------------|
| `emailService.js` | **Resend HTTP API** | Production (Render) — active |
| `emailService_Nodemailer.js` | **Gmail SMTP** | Local dev or non-Render hosts — backup |

**To switch to Nodemailer:** rename `emailService_Nodemailer.js` → `emailService.js`, uncomment the `EMAIL_*` variables in `.env`, and comment out `RESEND_API_KEY`.

> **Why Resend?** Render's free tier blocks outbound SMTP (ports 25/465/587). Resend uses HTTPS (port 443).

## 🆘 Troubleshooting quick notes

- If uploads fail, verify Cloudinary credentials and file size limits. 📤
- If emails fail (Resend), verify `RESEND_API_KEY` is set correctly. 📧
- If emails fail (Nodemailer), verify `EMAIL_USER` and `EMAIL_PASS` (Gmail app password). 📧
- If frontend cannot reach backend, check API base URL and CORS/client URL settings. 🌐

## 🤝 Contributing

1. Create a feature branch.
2. Make focused commits.
3. Open a PR with clear test steps and screenshots for UI changes.

## 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project under the terms of the MIT license.

See the full license text in the [`LICENSE`](LICENSE) file.

---

Built with ❤️ for creators, freelancers, and teams using Skillify.
