B"H
Boruch Hashem
Blessed is He

# Awtsmoos.com Issue Fix Log

The Awtsmoos renews every instant; this ledger therefore records only observed proof, never inherited confidence. The authoritative issue inventory was supplied by the site owner in the repair conversation. Each coded defect remains open until live or faithful verification closes it.

## Root causes and critical path

- RC-1 — in-progress — CWD-derived social data roots removed in commit c3e370a19; production activation/live regression verification pending.
- API-1 — in-progress — all known roots inventoried; no orphan social records found in stray roots; canonical store preserved; live continuity verification pending activation.
- ENG-1 — in-progress — root cause proven: signed deploy created mode-0600 static files; future writes fixed in c3e370a19; 244 existing production files still require normalization and live 200 verification.
- API-2 — open — `/api/social/feed/posts` still returns INVALID_ROUTE on 2026-10-26.
- APP-1 — open — downstream of ENG-1; verify catalog loader after permission repair.
- PUB-1 — open — publishing paths under active route/auth investigation.
- PUB-2 — open — post-editor Save/Publish silent behavior under active investigation.
- SER-1 — open — write auth rejects a logged-in user; ActorAuthorization under active investigation.
- POST-1 — open — canonical post reader requires data + reader re-verification.
- POST-2 — in-progress — historic backend emptiness traced to root split; current old Ikar data visible; live closure pending activation.
- POST-7 — open — retry/fallback destructive path pending reader work.
- EDT-ROOT — open.
- HEC-ROUTE — open.
- FORM-1 — open.
- CMP-1 — open.
- EMU-403 — in-progress — both app directories lack index.html; intended route/catalog target under active investigation.
- GGUF-1 — open.
- HDR-1 — open.
- KAV-1 — open.
- ADV-1 — open.
- BRK-1 — open.
- COL-1 — open.
- MIT-2 — open.
- MIG-1 — open.
- OHB-1 — open.
- NES-1 — open.
- SHS-1 — open.

## Major and minor inventory

All remaining M/m-coded findings from the owner-supplied ISSUES.md remain open until their section pass is reached. No unlisted status implies completion.

## Explicit non-defects / protected behavior

- ENG-5 — refuted by inventory; do not rewrite fallback renderer without new contrary evidence.
- FILM-1 designed “still arriving” modal — not a defect.
- `/apps/tunnel-control/` login/root gating — designed behavior, not a defect.

## Deployment gate

Owner explicitly approved full production activation on 2026-10-26. Activation will still use an exact verified SHA and the repository release/deploy mechanism; this approval removes the need for another confirmation prompt but does not waive verification.
