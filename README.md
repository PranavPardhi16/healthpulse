# 🩺 HealthPulse - Real-Time Telemedicine Command Center

A professional, high-performance telemedicine platform built with **Next.js 15**, **React 19**, and **Prisma**. This application features a dual-interface ecosystem for Doctors and Patients, providing real-time vital sign monitoring, automated clinical alerts, and secure authentication.

---

## 🚀 Key Features

* **Doctor Dashboard**: A unified command center for monitoring multiple patients simultaneously with real-time health data streams.
* **Patient App**: A user-friendly interface for patients to view personal health trends, connectivity status, and vital history.
* **Clinical Alert System**: Sophisticated logic to detect and categorize vitals into `Normal`, `Warning`, or `Critical` statuses with instant notification.
* **Real-time Visualization**: Interactive trend charts and sparklines using **Recharts** for monitoring Heart Rate, SpO₂, Temperature, and Blood Pressure.
* **Secure Authentication**: Integrated **NextAuth.js** with Google OAuth and Role-Based Access Control (RBAC).
* **Persistence**: Robust data management using **Prisma ORM** with an optimized SQLite backend for clinical records and user profiles.

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router), React 19 |
| **Styling** | Tailwind CSS, Lucide React (Icons) |
| **Database** | Prisma ORM, SQLite |
| **Auth** | NextAuth.js (Google OAuth) |
| **Charts** | Recharts |
| **Notifications** | Sonner (Toast Notifications) |

---

## 📁 Project Structure

```text
src/
├── app/                  # App Router & Server Components
│   ├── api/              # Backend API Routes (Auth & Data)
│   ├── doctor-dashboard/ # Doctor-specific views & logic
│   ├── patient-app/      # Patient-specific views & logic
│   └── sign-up-login/    # Authentication & Onboarding pages
├── components/           # Reusable UI elements (Sparklines, Providers)
├── lib/                  # Shared utilities (Auth config, Prisma client, Vitals logic)
└── styles/               # Global CSS & Tailwind Theme configuration
```

## ⚙️ Installation & Local Setup
1. Clone and Install:
```bash
npm install
```
2. Database Initialization:
```bash
npx prisma generate
npx prisma db push
```

3. Environment Configuration:
Create a ```.env``` file in the root directory and add your credentials:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:4028"
GOOGLE_ID="your_google_client_id"
GOOGLE_SECRET="your_google_client_secret"
```

4. Run Development Server:
```bash
npm run dev
```
Access the application at: ```http://localhost:4028```

---

## 🛡️ Security & RBAC
The system is designed with privacy in mind. Currently, the platform supports:
1. **Google OAuth**: Streamlined login for patients.
2. **Credential Switching**: Context-aware routing for Demo Doctor accounts and Patient profiles.
3. **Environment Protection**: Strict ```.gitignore``` policies to ensure sensitive API keys and local databases remain secure.
## 🔮 Future Roadmap
1. **Strict Middleware Sandboxing**: Implementing advanced server-side redirects to ensure 100% isolation between Doctor and Patient routes.
2. **IoT Integration**: Direct API hooks for wearable devices (Apple Health, Fitbit).
3. **AI Diagnostics**: Predictive analytics to forecast potential health crises based on historical vital trends.

---
_Built with ❤️ for the future of Digital Healthcare._
