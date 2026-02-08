# TRU-Pronounce Runtime (Svelte)

Public-facing app to build and play Name Cards.

## What it does
- Loads the curated Runtime Library (`index.json`, `cards/*.json`)
- Lets users search for existing names and variants
- Lets users build/edit pronunciation chips and play with Web Speech API
- Exports a submission package (JSON + optional audio) for upload to the Submission Inbox

## Configure library URL

Set `VITE_LIBRARY_BASE_URL` to where your Runtime Library is hosted.
Examples:
- GitHub raw: `https://raw.githubusercontent.com/<ORG>/<REPO>/main`
- GitHub Pages: `https://<org>.github.io/<repo>`

Copy `.env.example` to `.env.local`.

## Run locally
```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)
This is a Vite app. Build and deploy `dist/` to GitHub Pages.

