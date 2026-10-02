# My Plans

A tiny installable phone app (PWA) for keeping any lists you like: workout plan, meal plan, groceries, anything.

- Make pages, add items, tick them off, edit, reorder (↑/↓), delete.
- Starts from Blank, Workout or Meal plan templates.
- Works offline. Data is stored only on your device (`localStorage`).
- ⋯ menu: export/import a JSON backup (do this now and then).

No build step, no dependencies: plain HTML/CSS/JS.

## Put it on your iPhone
1. Host the repo root on any static HTTPS host (e.g. GitHub Pages: Settings → Pages → Deploy from branch → root).
2. Open the URL in **Safari** on the iPhone.
3. Share → **Add to Home Screen**. Do this *before* entering data: the Home Screen app keeps its own storage, separate from Safari's.

## Develop
`python3 -m http.server` in the repo root, then open http://localhost:8000. Bump `CACHE` in `sw.js` when you ship changes.
