# TRU-Pronounce — Contracts (Runtime App)

This document defines **Phase 0** contracts between the three-repo architecture:

1) **Runtime App (this repo)** — UI + authoring, Web Speech playback, optional recording capture (future), emits a JSON “Name Card”. Reads curated library (read-only). Submits to inbox (not implemented yet).
2) **Submission Inbox** — private moderation queue for unreviewed submissions. Stores raw submissions + discussion. Promotion to library is manual at first.
3) **Runtime Library** — public curated dataset containing **only approved** cards. The Runtime App reads it to render/search.

These contracts are **documentation + schema only** in Phase 0. No network calls are implemented yet.

## Canonical Data Artifact: Name Card JSON

The canonical artifact is a single **Name Card** JSON object. It must preserve everything the user set, especially:

- final syllables
- IPA
- plain-language guidance (e.g. “Like David with a K…”)
- selected voice metadata
- **CRITICAL:** `tts.payload` (the exact string used to drive Web Speech / TTS)

Audio is optional and stored separately (not embedded in JSON).

## State / Moderation

- Submissions must not appear publicly until approved.
- Inbox is for draft/submitted/needs-review.
- Library is approved-only.

## Read Contract (Runtime App → Runtime Library)

Runtime App reads (read-only):

- `/index.json`
- `/cards/{cardId}.json`
- `/audio/{cardId}.webm` (or similar)

Runtime App **never writes** to the library repo.

## Write Contract (Runtime App → Submission Inbox)

Abstract interface (not implemented yet):

`submitNameCard({ card: NameCardJSON, audio?: Blob }) -> { status, message }`

This is configurable via a placeholder `submissionEndpoint` string (see `src/config/contracts.js`).

Later phases should show “under review” messaging; not implemented in Phase 0.

## Promotion Contract (Inbox → Library)

Manual (initially):

1) Copy approved JSON + audio into the library repo.
2) Update `index.json`.

## Runtime Configuration Placeholders

See `src/config/contracts.js` for:

- `LIBRARY_INDEX_URL` — will point to the Runtime Library `index.json` (raw URL or Pages)
- `SUBMISSION_ENDPOINT_URL` — placeholder for future submission handling (issues/PRs/worker/etc.)

## Schema

The canonical schema is:

- `schema/name-card.schema.json`

An example instance is:

- `examples/name-card.example.json`

