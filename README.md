# 📈 StreakFlow — Premium Habit Streak Tracker

StreakFlow is a stunning, premium Single Page Application (SPA) designed to build consistency and track daily habits. Built with a modern, glassmorphism-themed SaaS interface resembling notion, Stripe, and Linear, it runs entirely client-side with full local multi-user support and persistent browser storage.

👉 **Features**:
- 🔐 **Local Multi-User Auth**: Fully functional Register (Sign Up) and Login (Sign In) flows with input validation. Scopes and isolates user data (habits, calendar histories, achievements) per email address.
- 🌅 **Time-of-Day Greetings & Digital Clock**: Features live ticking clock, current date display, daily challenge, and time-aware greeting cards.
- 📊 **Dynamic Statistics Dashboard**: Tracks active streaks, max streaks, completion percentages, active habits, completed items, and overall productivity scores.
- 📅 **Interactive 30-Day Calendar Grid**: A calendar inside each habit card displaying completed (🟢), missed (🔴), today (🔵), and upcoming (⚪) days. Toggle cells to backfill or adjust logs.
- 🎨 **SaaS-Style Styling & Dark Mode**: Modern dark/light theme switching with smooth transitions, custom scrollbars, and floating glow ambient bubbles.
- 🏆 **Milestone Badges**: Auto-unlock achievements (e.g. 7-Day Streak, Consistency Master) featuring premium particle confetti bursts.
- 📈 **High-End Analytics Portal**:
  - Weekly and Monthly consistency rates using Recharts.
  - Performance rankings database listing best vs. needs-attention habits.
  - **GitHub-style Contribution Heatmap** displaying habit completions over the past 365 days.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 (with custom glassmorphism utilities)
- **Animations**: Framer Motion
- **Navigation**: React Router DOM (HashRouter)
- **Icons**: React Icons (Feather & FontAwesome)
- **Charts**: Recharts
- **Confetti**: Canvas Confetti

---

## 🚀 Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/arvindpeddagolla-cloud/streak-flow.git
   cd streak-flow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) (or the next available port) to explore the application.

4. **Compile production build**:
   ```bash
   npm run build
   ```
   This generates optimized, static files in the `dist/` directory ready for deployment.

---

## 💾 Multi-User Data Engine

StreakFlow partitions data inside the browser's `localStorage` based on the authenticated email address:
- Users Database: `streakflow_v3_users_db`
- Active Session: `streakflow_v3_user`
- Scoped Habit Logs: `streakflow_v3_habits_${email}`
- Scoped Achievements: `streakflow_v3_achievements_${email}`

This guarantees data isolation: Bobs' habits are invisible to Jane, even though both run locally in the same browser.
