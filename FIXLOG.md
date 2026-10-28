B"H
Boruch Hashem
Blessed is He

# Awtsmoos.com Issue Fix Log

The Awtsmoos renews each instant; this ledger names what the tests truly show, without mistaking a bright entrance for the whole journey. Evidence last refreshed October 28, 2026. The original issue IDs and non-defect protections remain authoritative. “Open” includes anything that still lacks a complete, passing acceptance test.

## Verified releases

- DEPLOY — verified — secured Unix installer public contract corrected in `77709e630b33bd5b1e6dcdf95939ef415bfccaa8`; GitHub Actions run 40726010339 succeeded, production SHA and public assets matched.
- HDR-CSS — verified — search theme variables split from result cards in `be423faebfd7c3bb5ebf4b41aa709b84ad4383c9` without changing CSS declarations; header contract tests passed and GitHub Actions run 40726893755 succeeded.
- READER-MOBILE — verified within tested scope — fixed bilingual typography, `Aa` font adjustment, navigation, lightweight pair highlighting, portrait/landscape Chrome emulation and no unintended layout shift. Real Android/iOS hardware acceptance is still outstanding.
- DRIVE-ARCHIVE — verified bytes, NOT cleanup — all 92 physical and 36 embedded Drive replacements returned byte-exact manifest hashes/sizes; all 92 remaining production files matched original hashes and sizes. No image files were deleted.

## Original critical-path issue IDs

- RC-1 — partially verified — code removed CWD-derived social roots in `c3e370a19`; complete live data-root regression and auth provenance remain to be certified.
- API-1 — partially verified — old stray-root inventory reported no orphan records; canonical read/write continuity and permissions remain to be proven.
- ENG-1 — open for full scope — historical mode-0600 static file failure; tested current public routes return 200, but the complete historical 244-file permission census has not been repeated.
- API-2 — resolved for public GET — `/api/social/feed/posts` now returns HTTP 200 and `ok: true`; authenticated mutations are tracked by PUB/SER, not this read-only result.
- APP-1 — partially verified — `/apps/` and `/apps/awtsmoos-gguf/` return HTTP 200; catalog launch, filtering and authentication require functional browser acceptance.
- PUB-1 — open — canonical production create/publish/read/edit/delete TEST flow not verified.
- PUB-2 — open — post-editor Save/Publish behavior not proven against authenticated production storage.
- SER-1 — open — signed-in write permissions and alias ActorAuthorization positive/negative tests remain.
- POST-1 — partially verified — live canonical Likkutei Sichos reader and sampled routes render; full post-type matrix remains.
- POST-2 — partially verified — old Ikar data visible in the live reader; historical root-split recovery requires wider storage validation.
- POST-7 — partially verified — tested reader recovery and missing-route behavior; destructive retry/fallback possibilities need final negative tests.
- EDT-ROOT — open — complete authenticated Heichel and post-editor persistence and ownership test.
- HEC-ROUTE — partially verified — Ikar Heichel/series/post routes work; aliases, nested relations, permission boundaries need complete acceptance.
- FORM-1 — open — authenticated forms and failed-save feedback not fully verified.
- CMP-1 — open — composer mocked browser fixture and production authenticated publication are separate gates; full live lifecycle not proven.
- EMU-403 — resolved for entry routes — former missing-index claim is outdated: Apps and GGUF entry URLs now return 200; functional acceptance remains under APP/GGUF.
- GGUF-1 — open — real GGUF model parsing, memory and failure states have not been accepted.
- HDR-1 — partially verified — header search and shared header contracts pass; mobile keyboard/focus and signed-in navigation require broader browser acceptance.

## Games: public routes exist; playability remains open

- KAV-1 — open — `/games/KAVANAH/` HTTP 200; gameplay acceptance pending.
- ADV-1 — open — `/games/adventure/` HTTP 200; gameplay acceptance pending.
- BRK-1 — open — `/games/brick-blast/` HTTP 200; gameplay acceptance pending.
- COL-1 — open — `/games/connect4/` HTTP 200; gameplay acceptance pending.
- MIT-2 — open — `/games/mitzvahWorld/` HTTP 200; gameplay acceptance pending.
- MIG-1 — open — `/games/migdol/` HTTP 200; gameplay acceptance pending.
- OHB-1 — open — `/games/ohrbound/` HTTP 200; gameplay acceptance pending.
- NES-1 — open — `/games/neshama-quest/` HTTP 200; gameplay acceptance pending.
- SHS-1 — open — `/games/shema-strike/` HTTP 200; gameplay acceptance pending.
- GAMES-OTHER — open — `/games/ohr-hagnuz/` HTTP 200; gameplay acceptance pending.

## Remaining release gates

- IMAGE-CONSUMERS — open — verify no active code, saved posts or user-generated content references old physical URLs before deleting any of the 92 files.
- AUTH-PUBLISH — open — TEST actor authorization, actual Save/Publish/Read/Edit/Delete and exact cleanup verification required.
- GAME-ACCEPTANCE — open — start/play/pause/restart on ten games, touch and keyboard on mobile.
- GGUF-ACCEPTANCE — open — real model parser and bounded error/memory recovery.
- GIT-LOCAL — open — local Mac main diverges from origin/main, with piano, composer, game and tunnel owner edits preserved. Do not reset or bulk-stage.
- DEVICE-ACCEPTANCE — open — physical Android/iOS reader and app testing.
- M/m INVENTORY — open pending owner ISSUES.md per-section reproduction. Historical issue labels alone are not proof of a current regression.

## Explicit non-defects / preserved behavior

- ENG-5 — refuted by prior inventory; do not rewrite fallback rendering without contradictory evidence.
- FILM-1 — “still arriving” modal is intentional behavior.
- `/apps/tunnel-control/` authentication/root gating is intentional, not a bug.

## Production safety gates

The owner authorized full deployment on October 26. Every later release must still preserve existing data and owner work, require an exact Git SHA, pass automated and live checks, and never delete old physical image files based only on successful Drive uploads. HTTP 200 is a route check, not proof of successful gameplay, saved edits, or publication.
