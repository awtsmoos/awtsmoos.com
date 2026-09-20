# WorkOS — Build Log (v0.1)

**Location:** `geelooy/apps/workos/` · served conventionally at `/apps/workos/`
**Status:** v0.1 working vertical slice · local-first (browser `localStorage`), dependency-free vanilla JS
**Last updated:** 2026-09-20 (UTC)

> Constraint honored: purely additive. No tunnel files touched; tunnel behavior unchanged.

## What works today

**Core (Work Graph + event fabric as source of truth)**
- Permanent entity identities: `awts://entity/<kind>/<id>` for missions, work items, agents, files, rooms.
- Append-only causal event fabric: every change is an event with sequence number, timestamp, actor, and causal links.
- Facts vs claims vs decisions kept separate: `fact.*`, `claim.*`, `decision.*` event families; `decisions.list()` returns one aggregated object per title `{title, status, mission, ts, seq, rationale, supersedes, eventId}` where status = latest `decision.*` suffix.
- Missions + work items: statuses `todo|doing|blocked|review|done`, dependencies, blockers, progress rollups, delegation.
- Persistent semantic mission rooms: message kinds (question/answer/decision/progress/blocker/note/handoff/request), presence, history.
- Provenance: file entities with who/why edit history; tool-boundary records.
- Graph queries: `graph.related(entityId, {depth})` across links/mentions/dependencies.
- Context capsule compiler: layered, token-budgeted (`laws` mandatory → objective → canonical_decisions → active_work → blockers → peer_obligations → recent_discoveries → known_failures), truncates lowest-priority first.
- Idempotent seed: "Tunnel Hardening — v0.1" demo world (mission, 6 work items, 3 agents + human, semantic room, facts/claims, decisions incl. a superseded one, provenance, file history).

**UI (filesystem/desktop feel over the graph)**
- `index.html` + hash router: Home grid (missions, agents, recent activity) and Mission pages with 7 tabs — Overview, Work, Agents, Room, Files, Decisions, Activity.
- Semantic room badges + composer with message-kind picker; agent roster with presence; work status controls + filters; file who/why history; decision lifecycle pills incl. superseded chains; XSS-safe escaping of interpolated data; responsive dark-first styling.
- `ui/stub.workos.js` exists for dev/test only and is **not** loaded by `index.html`.

## Tests & verification (all in the real repo, `node` on the Mac)

| Suite | Result |
|---|---|
| `core/core.test.mjs` | **17 passed, 0 failed** |
| `ui/ui.test.mjs` | **14 passed, 0 failed** |
| `node --check` on every core + UI file | clean |
| Integration harness (real core + real views, no DOM) | **12/12 green** — home/mission render, all 7 tabs, room badges/messages, file history, decisions incl. superseded, activity, capsule budget + laws layer |

**Wiring fixes found by the integration harness (2026-09-20):**
1. Views treated `ev.actor` (object `{kind,id,name?}`) as a string → added shared `actorName()` helper in `ui/components.js`, hardened `avatar()` against non-strings; fixed 5 call sites in `home.js`/`mission.js`.
2. Decisions tab assumed raw decision events; core returns aggregated decision objects → tab now accepts both shapes.
3. `CONTRACT.md` amended to document the aggregated `decisions.list()` return shape.

## Intentionally stubbed / future (not in v0.1)

- Projects/Shared areas are visually present but marked "soon" (no backend).
- No server event-log API, cross-device room sync, or realtime transport.
- No capability-token permission system, no sharing/fork/contribution backend.
- No federation, no embeddings-assisted retrieval, no agent reliability scoring.
- State is per-browser `localStorage`; not yet multi-user or server-synchronized.

## Known limitations

- v0.1 is a single-user local slice; the Work Graph vision (server fabric, rooms sync, provenance across tools) arrives in v0.2+.
- Browser visual QA (real Chromium walkthrough) has not been performed in this build pass.
- Public serving path assumed `/apps/workos/` by geelooy convention; not yet verified against a live server response.

## Files

- `ARCHITECTURE.md` — north-star blueprint · `CONTRACT.md` — v0.1 JS API contract
- `core/`: `util, events, entities, graph, work, rooms, provenance, capsule, seed, store` (+ `core.test.mjs`)
- `ui/`: `app.js` (router/boot), `components.js`, `views/home.js`, `views/mission.js`, `styles.css` (+ `ui.test.mjs`, `stub.workos.js` dev-only)
- `index.html` — entry point
