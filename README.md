# SWCP - Headless Visual CMS & Admin Dashboard

A powerful, multi-tenant SaaS application that allows users to perform **in-place visual edits** on their external websites without writing a single line of code. Built with the MERN stack and a robust Vanilla JS SDK, it transforms static HTML websites into fully dynamic platforms using a split-pane control center.

![Visual Editor Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80) 
*(A sleek, brutalist-inspired beige dashboard offering an enterprise-grade experience.)*

## ✨ Key Features
- **Auto-Scanning SDK (`sdk.js`)**: A lightweight, standalone script that users embed into their website. It recursively scans the DOM, maps text and images to unique CSS selectors, and broadcasts the layout back to the dashboard.
- **Split-Pane Visual Editor**: The dashboard generates smart `<form>` inputs on the left panel for every editable block found on the user's website, rendering the live site via an `<iframe>` on the right.
- **Bi-Directional Sync**: Editing forms in the dashboard triggers an instant `postMessage` event that visually updates the live iframe preview—giving a true "WYSIWYG" (What You See Is What You Get) feel.
- **Real-Time Analytics**: Tracking page views, last visitor activity, and edit statistics (live vs. draft) across all managed domains.
- **Multi-Tenant Architecture**: Robust `req.userId` filtering at the MongoDB/Mongoose layer ensures absolute data isolation between different registered users.
- **Responsive Previews**: Within the editor, toggle instantly between Desktop (`100%`) and Mobile (`375px`) viewport containers to verify styles on the fly.
- **Real-Time Auto-Save**: Dashboard edits are automatically debounced and persisted to the backend MongoDB `WebsiteEdit` collection.

## 🛠️ Tech Stack
- **Frontend (Admin Panel)**: React.js, React Router, Tailwind CSS, Context API.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose.
- **Authentication**: JWT (JSON Web Tokens) via `httpOnly` secure cookies.
- **Tracking & Analytics**: Custom ping-based tracking via `Analytics` model.
- **External Scripting**: Vanilla JavaScript APIs, `window.postMessage`, `MutationObserver`.

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 2. Environment Variables (.env)
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/swcp
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### 3. Install Dependencies
Install dependencies for both the Frontend and the Backend.
```bash
# In the root directory (Backend)
npm install

# In the admin-panel directory (Frontend)
cd admin-panel
npm install
```

### 4. Running the Project
Use the concurrent dev script from the root directory to spin up both the Vite React app and the Node.js API.
```bash
npm run dev
```
- **Admin Dashboard**: `http://localhost:5174`
- **Backend API**: `http://localhost:5000`

---

## 🚀 Deployment (Live Ready)

This project is configured for seamless deployment on **Vercel** (Frontend) and **Railway** (Backend).

### 1. Backend (Railway)
1. **Connect Repo**: Login to [Railway](https://railway.app) and link this repository.
2. **Environment Variables**: Add the following in the Railway dashboard:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A strong random string.
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app` (your frontend URL).
   - `BACKEND_URL`: `https://your-api.up.railway.app` (your Railway public URL).
   - `NODE_ENV`: `production`
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`

### 2. Frontend (Vercel)
1. **Connect Repo**: Login to [Vercel](https://vercel.com) and link this repository.
2. **Root Directory**: Set to `admin-panel`.
3. **Environment Variables**:
   - `VITE_API_URL`: `https://your-api.up.railway.app/api` (your backend Railway URL + `/api`).
4. **Build Command**: `npm run build`
5. **Framework Preset**: `Vite`

---

## 🎨 How to Use the Visual CMS (Integration Guide)

1. **Register & Login**: Create a new account on the dashboard.
2. **Link Domain**: Go to **System > Integration** and enter the Base URL of the external website you wish to control.
3. **Embed the SDK**: Copy the provided personalized `<script>` tag and paste it right above the `</body>` tag in your external website's HTML file.
```html
   <!-- Example Script -->
   <script src="http://localhost:5000/sdk.js" data-user-id="YOUR_USER_ID"></script>
```
4. **Edit Visually**: Navigate to **CMS > Visual Editor** in the dashboard. Your website will load into the preview screen, and your content blocks will automatically become editable fields on the left.
5. **Publish**: Content changes are auto-saved and served to live visitors fetching from `/api/public/edits/:userId`.

---

## 📁 Directory Structure
```text
/
├── admin-panel/             # React Vite Frontend SPA
│   ├── src/
│   │   ├── components/      # Sidebar, Topbars, Layout Elements
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # VisualEditor, IntegrationDashboard, AnalyticsView
│   │   └── services/        # Axios API configurations
├── server/                  # Node.js + Express Backend
│   ├── public/              # Served statically (Contains `sdk.js`)
│   ├── src/
│   │   ├── controllers/     # Auth, Views, Editor logic
│   │   ├── middleware/      # JWT verification, Error handling
│   │   ├── models/          # User, WebsiteEdit, Analytics, Contact
│   │   └── routes/          # API definitions (auth, edits, analytics)
├── index.html               # Dummy Local Testing Site
└── package.json             # Root workspace package.json
```

## 🔐 Security
- Private API routes strictly require Cookie verification.
- Database records are strictly scoped by `userId`.
- External IFrames are secured via origin-independent Event Bus (`postMessage`) validated by MongoDB mappings.
