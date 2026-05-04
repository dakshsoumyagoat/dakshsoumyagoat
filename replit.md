# JEE Command Center

A modern, futuristic, AI-powered productivity platform for IIT-JEE aspirants. Built as a React + Vite single-page application with a dark neon aesthetic.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + custom CSS variables (neon green/black theme)
- **State Management**: Zustand
- **Charts**: Recharts (line, area, bar, radar charts)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter + JetBrains Mono (Google Fonts)

## Architecture

- `src/store/useStore.ts` — Global Zustand store with all app state (chapters, sessions, mock tests, tasks, bookmarks, formulas, gamification)
- `src/components/` — One component file per view/page
- `src/App.tsx` — Root component with sidebar + animated view router
- `src/index.css` — Global styles with CSS custom properties for theming

## Features

1. **Command Center (Dashboard)** — Score trends, study heatmap, AI insights, weak chapter alerts, today's targets, skill radar
2. **Syllabus Tracker** — Per-chapter progress tracking (theory, PYQs, accuracy, mastery) for Physics/Chemistry/Mathematics with expandable rows and sliders
3. **Study Planner** — Adaptive daily task planner with AI suggestions, burnout meter, weekly load visualization
4. **Test Analytics** — Mock test logging, score trends, subject-wise performance, rank predictor
5. **Revision System** — Spaced repetition scheduler (1d/3d/7d/21d/30d cycles), revision calendar, retention health
6. **Focus Mode** — Pomodoro/Deep Work/Sprint timer with SVG ring, ambient sounds, session tracking
7. **Question Bank** — Bookmark hard questions, tag mistakes, track attempts, filter by subject/difficulty/solved
8. **Formula Vault** — Subject-organized notes with pinning, inline editing, markdown-style display

## Design System

- Dark background: `#050505`
- Neon green accent: `#39ff14` with glow shadows
- Glassmorphism card elements
- Custom CSS scrollbars, progress bars, badges
- JetBrains Mono for numbers/code

## Development

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Production build
```

## Deployment

Configured as a **static** deployment:
- Build command: `npm run build`
- Output directory: `dist`
