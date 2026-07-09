# 🚀 Deployment Guide

This guide details how to deploy the **Dev Consilium** backend to **Render** and the frontend to **Vercel**.

---

## 🏛️ Part 1: Deploy Backend to Render

Render will host the Node.js/Express backend, which handles GitHub cloning and communicates with the Groq API.

### Steps:
1. Sign in to [Render](https://dashboard.render.com/).
2. Click the **New +** button and select **Web Service**.
3. Connect your GitHub repository: `omkarsunilshivarkar/Dev-Consilium`.
4. Configure the Web Service settings:
   * **Name:** `dev-consilium-backend` (or your preferred name)
   * **Region:** Choose the region closest to you
   * **Branch:** `main`
   * **Root Directory:** `backend` *(⚠️ Critical: This must be set to `backend`)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Add the necessary Environment Variables:
   * Scroll down and click **Advanced** -> **Add Environment Variable**.
   * Add the following keys:
     * `GROQ_API_KEY` = `your_groq_api_key`
     * `GROQ_MODEL` = `llama-3.3-70b-versatile` (optional, defaults to this if omitted)
6. Select the **Free** instance type (or any other tier you prefer).
7. Click **Deploy Web Service**.
8. Once the deployment finishes, copy your Web Service URL (e.g., `https://dev-consilium-backend.onrender.com`). You will need this for the frontend configuration.

---

## 🌐 Part 2: Deploy Frontend to Vercel

Vercel will host the React/Vite frontend. It will be configured to point to the backend URL you created in Part 1.

### Steps:
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository: `omkarsunilshivarkar/Dev-Consilium`.
4. Configure the Project settings:
   * **Framework Preset:** `Vite` (Vercel should auto-detect this)
   * **Root Directory:** Keep it as the project root `./` (do not change this to `src` or `backend`)
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Add the Environment Variable to link to the backend:
   * Expand the **Environment Variables** section.
   * Add:
     * **Key:** `VITE_API_BASE_URL`
     * **Value:** `https://your-render-backend-url.onrender.com` (replace with your actual Render Web Service URL from Part 1. *Note: Do not add a trailing slash*)
6. Click **Deploy**.
7. Once completed, Vercel will provide you with a production URL for your frontend application!

---

## 🔄 Updating Deployment

Whenever you push new changes to the `main` branch of your GitHub repository:
- Render will automatically rebuild and redeploy your backend.
- Vercel will automatically rebuild and redeploy your frontend.
