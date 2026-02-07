# TRU-Pronounce — Phase 0 Architecture (3-repo)

This workspace is split into three Git repositories with explicit contracts to keep Phase 0 experimentation safe and separable.

## Repositories

1) **Runtime App (public)**  
   Purpose: UI + authoring sandbox, Web Speech playback, optional future capture of user recordings. Produces a JSON Name Card.

2) **Submission Inbox (private)**  
   Purpose: moderation queue for unreviewed submissions. Contains drafts/submitted items and review notes. Nothing here is public by default.

3) **Runtime Library (public, read-only consumption)**  
   Purpose: curated dataset of **approved only** Name Cards + optional audio. Runtime App reads this for browsing/search/display.

## Data Model

The shared artifact is a **Name Card JSON** defined by `schema/name-card.schema.json`.

The schema is copied verbatim into each repo so the contract is visible at the boundary.

## Data Flow (Phase 0 / No Network Calls)

- Runtime App authors a card locally and stores it on-device (localStorage).
- Runtime App can later submit a card to the Submission Inbox via a configurable endpoint. (Not implemented yet.)
- Promotion from Inbox to Library is manual in Phase 0: copy files + update `index.json`.

## Read Paths (Library)

Runtime App expects the library to expose:

- `index.json`
- `cards/{cardId}.json`
- `audio/{cardId}.webm` (or similar)

## Write Paths (Inbox)

Abstract submission contract (not implemented yet):

`submitNameCard({ card: NameCardJSON, audio?: Blob }) -> { status, message }`

## GitHub Pages (Runtime App)

Runtime App deploys via GitHub Actions to:

`https://<username>.github.io/TRU-Pronounce/`

Vite must use:

`base: "/TRU-Pronounce/"`
