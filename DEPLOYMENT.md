# 🚀 Deployment Guide (Vercel Multi-Services)

This project is configured to deploy both the frontend (React/Vite) and the backend (Node/Express) onto **Vercel** using its multi-service workspace configuration (`vercel.json`).

---

## 🌐 Deploying to Vercel

With the [vercel.json](file:///c:/Omkar.Shivarkar/Dev%20Consilium/vercel.json) file at the root of the workspace, Vercel will build and run both the frontend and backend services under the same domain. All `/api/*` traffic will be routed to your backend service automatically.

### Steps:

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository: `omkarsunilshivarkar/Dev-Consilium`.
4. Vercel will automatically detect the `vercel.json` configuration and provision the services.
5. **Configure Environment Variables:**
   * Go to the **Environment Variables** section in your Vercel project settings.
   * Add the following variable required by the backend:
     * **Key:** `GROQ_API_KEY`
     * **Value:** `your_groq_api_key_here`
   * *(Optional)* **Key:** `GROQ_MODEL`
     * **Value:** `llama-3.3-70b-versatile` (defaults to this if not specified)
6. Click **Deploy**.
7. Vercel will deploy your application and provide a single URL.
   * The frontend will load at the main URL.
   * The backend API endpoints will be accessible under `/api/*` on the same domain.

---

## 💻 Local Development

During local development, Vite's dev server is configured to proxy all `/api` requests to `http://localhost:3000`.

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
