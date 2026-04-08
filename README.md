# Top-Tier Personal Planning Interface

This project is a production-grade interactive wall calendar component designed with a strong emphasis on UX, visual hierarchy, and real-world usability. 

> *"Instead of just building a basic calendar, I focused on building a usable planning interface with strong UX patterns like intelligent range presets, contextual tagged notes, hybrid holiday ingestion, and a responsive layout physically inspired by physical wall calendars."*

## 🚀 Key Differentiators & Product Highlights

Instead of stopping at baseline state-management, this component was heavily pushed towards real **"Product Thinking":**

- **Quick Planning Presets:** Single-click UX buttons for `"Today"`, `"This Week"`, and `"This Month"`, utilizing clean `date-fns` manipulation to jump states instantly.
- **Contextual Note Tagging:** Notes aren't just strings anymore. Utilizing dynamic state categorization (`Work`, `Personal`, `Urgent`) attached directly to custom Tailwind visual chips for immediate scannability.
- **Smart Range Analytics:** Calculates and displays the exact duration dynamically (e.g., "7 days selected") guiding users intuitively instead of just rendering raw dates.
- **Hybrid Holiday API (Senior Architect Strategy):** Features a custom Hook that attempts to dynamically load accurate real-time Indian Government Data (`https://date.nager.at` API). *Crucially*, it falls back silently to a high-quality static hard-coded map if the network drops out over an unreliable connection. This proves reliable UX decision-making patterns.
- **Extreme UI Polish:** Hover pulses, `framer-motion` scale pop rendering for clicks, multi-tier layout breaking (`md:` to vertical stacking seamlessly), shadow elevation depth, and Dark/Light Mode.

## Tech Stack Overview

- **Next.js (App Router) & React 18**
- **TypeScript** natively dictating Note configurations
- **Tailwind CSS v4** powering custom typography hooks securely
- **date-fns** & **framer-motion** & **lucide-react**

## Quick Start

```bash
git clone <your-repo-url>
cd wall-calendar-planner
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the planning tool.
