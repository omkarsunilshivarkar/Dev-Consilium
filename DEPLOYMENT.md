# 🚀 Deployment Guide (Vercel Frontend + Render Backend)

This project is configured to host the **frontend on Vercel** and the **backend on Render**. 

We use a Vercel rewrite configuration ([vercel.json](file:///c:/Omkar.Shivarkar/Dev%20Consilium/vercel.json)) to proxy production `/api/*` requests directly to Render. This eliminates CORS issues and avoids having to configure API environment variables on Vercel.

---

## 🏛️ Part 1: Backend on Render

Your backend is hosted at: `https://dev-consilium.onrender.com`

### Configuration Checklist:
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `GROQ_API_KEY`: *(Required)* Your Groq API key.
  - `GROQ_MODEL`: *(Optional)* Defaults to `llama-3.3-70b-versatile` if not set.

---

## 🌐 Part 2: Frontend on Vercel

Vercel hosts the React/Vite frontend and proxies API requests to Render automatically via [vercel.json](file:///c:/Omkar.Shivarkar/Dev%20Consilium/vercel.json).

### Steps:
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository: `omkarsunilshivarkar/Dev-Consilium`.
4. Configure the Project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Keep it as the project root `./` (do not change this)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**.
6. Once deployed, Vercel routes `/api/*` requests directly to `https://dev-consilium.onrender.com/api/*`.

---

## 💻 Local Development

During local development, Vite's dev server proxies all `/api` requests to `http://localhost:3000`.

To run the project locally:
1. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. Start the frontend (from project root in a new terminal):
   ```bash
   npm install
   npm run dev
   ```
