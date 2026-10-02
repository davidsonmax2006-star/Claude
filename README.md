# My Plans

A tiny installable phone app (PWA) for keeping any lists you like: workout plan, meal plan, groceries, anything.

- **Guides:** a built-in Gym Plan (today's workout, weekly schedule, all sessions, logged weights) and Meal Plan (today's meals with macros, weekly rotation, recipes, Aldi shopping lists, notes). Ticks reset each day.
- Make your own pages, add items, tick them off, edit, reorder (↑/↓), delete.
- Starts from Blank, Workout or Meal plan templates.
- Works offline. Data is stored only on your device (`localStorage`).
- ⋯ menu: export/import a JSON backup, including guide progress (do this now and then).

No build step, no dependencies: plain HTML/CSS/JS.

## Put it on your iPhone
1. Host the repo root on any static HTTPS host (e.g. GitHub Pages: Settings → Pages → Deploy from branch → root).
2. Open the URL in **Safari** on the iPhone.
3. Share → **Add to Home Screen**. Do this *before* entering data: the Home Screen app keeps its own storage, separate from Safari's.

## Develop
`python3 -m http.server` in the repo root, then open http://localhost:8000. When you ship changes, bump `CACHE` in `sw.js` and the `?v=` number on the files in `index.html` and `sw.js`.

Guide content lives in `content/*.js` (plain data) and is drawn by `guides.js`.
