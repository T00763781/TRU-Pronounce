\# TRU-Pronounce



A \*\*Phase-0 authoring sandbox\*\* for exploring how people create, test, and share name pronunciations using browser-native text-to-speech.



This project is an early proof of concept for a future \*\*name pronunciation tool\*\* intended to support inclusion, accessibility, and respectful communication at Thompson Rivers University (TRU).



---



\## 🚧 Project Status



\*\*Phase 0 — Authoring \& Discovery (Current)\*\*



This repository represents an \*\*experimental, client-side sandbox\*\* used to:



\* Explore name pronunciation workflows

\* Stress-test text-to-speech behavior across real names

\* Discover what data is actually required before defining a formal schema

\* Validate UX assumptions before building a shared library



It is \*\*not\*\* a finished product.



---



\## ✨ What Works Right Now



The live demo allows you to:



\* Enter a name

\* Automatically generate:



&nbsp; \* syllable breakdown

&nbsp; \* IPA (best-effort, editable)

\* Edit syllables directly

\* Edit plain-language pronunciation guidance

\* Detect and select \*\*local browser TTS voices\*\*

\* Play pronunciation using a \*\*dual-pass approach\*\*:



&nbsp; 1. instructional (syllables with pauses)

&nbsp; 2. natural (merged pronunciation)

\* Save the current configuration \*\*locally in the browser\*\*

\* Reload and continue iterating



All functionality runs \*\*entirely client-side\*\*.



---



\## 🔊 How Pronunciation Playback Works (Phase 0)



Playback uses the \*\*Web Speech API\*\* and a single utterance with punctuation to encode two passes:



Example:



```

DAY, vik. Day-vik

```



\* Commas introduce short instructional pauses

\* The period separates learning from natural pronunciation

\* Hyphens encourage smooth phonetic merging



This approach was validated empirically using Windows TTS and avoids premature schema complexity.



---



\## 💾 Local-Only Persistence



\* Clicking \*\*“Save on device”\*\* stores the current configuration in `localStorage`

\* No files are downloaded

\* No data leaves the browser

\* This is intentional for Phase 0



Saved data includes both:



\* the editable configuration

\* the exact text payload sent to TTS (for observability)



---



\## 🚫 Intentionally Stubbed (Not Implemented Yet)



The following UI elements are \*\*present but non-functional by design\*\*:



\* \*\*Cloud Models\*\*

\* \*\*Add your voice\*\*

\* \*\*Iframe\*\*

\* \*\*Submit to library\*\*



These stubs exist to:



\* preserve future UX intent

\* avoid over-engineering before requirements are clear

\* signal planned capabilities without committing to implementation



---



\## 🧠 What This Phase Is \*Not\*



This project is \*\*not yet\*\*:



\* A public name library

\* A pronunciation database

\* A crowdsourced directory

\* A backend-connected service

\* A schema-finalized system



Those belong to later phases.



---



\## 🧪 How to Use This Repo (for Contributors)



This sandbox is best used by:



\* Trying real names (including your own)

\* Adjusting syllables until pronunciation feels right

\* Switching between local voices

\* Noting where assumptions break down



The goal is to let \*\*real usage inform future design\*\*, not to lock things in early.



---



\## 🗺️ Looking Ahead (High-Level)



Future phases may include:



\* A curated seed library of shared name cards

\* Optional submission workflows

\* Search and discovery

\* Governance and moderation

\* Institutional deployment on `tru.ca`



None of that is implemented here yet.



---



\## 🏷️ Attribution



Built as part of the \*\*2025–2026 Intercultural Ambassador Team\*\* initiative at Thompson Rivers University.



---



\## ⚠️ Notes for Reviewers



If you are reviewing this repo and wondering “why isn’t X implemented?” —

that is likely intentional.



Phase 0 is about \*\*learning what needs to exist\*\*, not building everything at once.



---

\## Contracts

See `CONTRACTS.md` for Phase 0 contracts and the canonical Name Card schema.

