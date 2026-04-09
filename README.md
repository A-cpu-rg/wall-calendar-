#  Interactive Wall Calendar Component

A production-grade, fully responsive React/Next.js wall calendar component with date range selection, tagged notes, and beautiful animations.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)

##  Demo

- **Live Demo:** [View on Vercel](https://wall-calendar-abhishek.vercel.app/) 
- **Video Walkthrough:** https://drive.google.com/file/d/135Gwt_g6IG9PuQw7oSZR4MIJ4I-348hp/view

##  Features

### Core Requirements 
-  **Wall Calendar Aesthetic** - Physical calendar look with spiral binding & hero images
-  **Day Range Selector** - Click to select start & end dates with visual states
-  **Integrated Notes** - Tagged notes (Work/Personal/Urgent) with CRUD operations
-  **Responsive Design** - Desktop grid → Mobile stack layout
-  **Data Persistence** - localStorage for notes & preferences

### Creative Extras 
-  **Dynamic Themes** - Each month has unique seasonal imagery & accent colors
-  **Keyboard Shortcuts** - Arrow keys, T for today, Esc to clear
-  **Dark/Light Mode** - Toggle with preference persistence
-  **Tag Analytics** - Monthly breakdown of notes by category
-  **Quick Presets** - One-click "Today", "This Week", "This Month" selection
-  **Holiday Markers** - Indian holidays via date-holidays library
-  **Edit Notes** - Inline editing for saved notes
-  **Export Notes** - Download notes as .txt file
-  **Quick Month Navigator** - Jump to any month instantly
-  **Full Accessibility** - ARIA labels, keyboard navigation
-  **Page Flip Animation** - Smooth month transitions

##  Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Date Utils:** date-fns
- **Holidays:** date-holidays

##  Quick Start

```bash
# Clone the repository
git clone https://github.com/A-cpu-rg/wall-calendar-.git
cd wall-calendar

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⌨ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← / → | Navigate months |
| T | Jump to today |
| D | Toggle dark mode |
| Esc | Clear selection |

##  Project Structure

```
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Home page
├── components/
│   └── WallCalendar.tsx # Main calendar component
├── package.json
└── README.md
```

##  Design Decisions

1. **Single Component Architecture** - Easy evaluation with clean internal separation
2. **Offline-First Holidays** - date-holidays with graceful static fallback
3. **localStorage Persistence** - No backend required per assignment guidelines
4. **Mobile-First Design** - Touch-optimized, then enhanced for desktop
5. **Accessibility Priority** - Full ARIA support & keyboard navigation

##  Testing Responsive Design

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test various screen sizes

---

**Built with  for the Frontend Engineering Challenge**
