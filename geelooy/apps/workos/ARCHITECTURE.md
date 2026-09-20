# WorkOS — Architecture Blueprint
<!-- B"H | Boruch Hashem | Blessed is He -->
**Status:** north-star design document · v0.1 implements the local-first slice
**Location:** `geelooy/apps/workos/` (additive; never modifies existing tunnel/site behavior)

> Awtsmoos becomes a persistent collaborative operating system for AI work —
> GitHub redesigned from the ground up for humans and AI agents, where what is
> preserved is not merely code, but the entire history of work: files, agents,
> missions, decisions, evidence, conversations, context, and deployments.

## 1. The one idea

**The system remembers work; agents don't have to remember chats.**
Agents and sessions are temporary processes. What survives is what actually
happened: work items, file mutations, tests, decisions, discoveries, failures,
deployments, artifacts, evidence, handoffs. Six months later, a new agent can
ask "why does this code exist?" and walk backward through real causal history
instead of hoping semantic search guesses correctly.

## 2. Layer map

```
┌─────────────────────────────────────────────────────────────┐
│ SURFACE — Virtual OS projections (filesystem-like UX,       │
│ mission pages, rooms, search, smart folders, sites)         │  human + agent
├─────────────────────────────────────────────────────────────┤
│ SERVICES — rooms/presence, context compiler, provenance,    │
│ permissions/capabilities, sharing/fork/contribute, search   │
├─────────────────────────────────────────────────────────────┤
│ WORK GRAPH — entity store + causal event fabric (THE truth) │
│   entities: files, agents, missions, work, decisions,       │
│   rooms, artifacts, deployments, sessions                   │
│   events: append-only, causally linked, typed              │
├─────────────────────────────────────────────────────────────┤
│ TRANSPORT — local first (v0.1) → server event log (v0.2) →  │
│ federated sync (v0.3). Transport is NOT identity.           │
└─────────────────────────────────────────────────────────────┘
```

The filesystem/desktop the human sees is **one projection** of the graph —
like Linux `/proc`: beautiful, familiar, but not the underlying reality.

## 3. Identity: everything gets a permanent URI

```
awts://entity/<kind>/<id>
```

- A file is `awts://entity/file/9f3k…`, not `/src/auth.js`. Rename it, move it
  ten times — same entity. `pathAliases[]` records every address it ever had.
- Same for agents, missions, work items, decisions, rooms, artifacts,
  deployments, sessions. **Paths are addresses, not identity.**
- v0.1 ids: `<base36 time><6 random>`; v0.2: ULIDs (lexicographically sortable).

## 4. The event fabric (deepest primitive)

Append-only. Every important action becomes an event:

```js
{ id, seq, ts, type, actor:{kind:"human"|"agent"|"system", id, name?},
  entity?, mission?, work?, room?, causes:[eventIds], data:{...} }
```

`causes[]` makes causality **explicit** — the chain
User Request → Mission → Work Item → Delegation → Agent → Discovery →
Decision → File Mutation → Test → Release → Deployment is stored, not inferred.

### Event taxonomy (v0.1)

| family | types |
|---|---|
| facts (observed) | `fact.file_mutated`, `fact.test_passed/failed`, `fact.command_exited`, `fact.http_status`, `fact.deployed`, `fact.agent_read_files` |
| claims (interpretation) | `claim.made` `{text, confidence}` |
| decisions | `decision.proposed/accepted/implemented/superseded/reversed/deprecated` |
| work | `work.created/status_changed/blocked/unblocked/delegated/completed/linked` |
| mission | `mission.created/status_changed` |
| room | `room.created/message/presence` |
| agent | `agent.registered/heartbeat` |
| file | `file.created/renamed/edited` |
| provenance | `provenance.recorded` |

### Facts ≠ claims ≠ decisions
- **Fact:** file hash changed, command exited 1, HTTP 500, test passed.
- **Claim:** "I think the 500 is stale auth." (confidence-scored, attributable)
- **Decision:** "We will hydrate auth before dispatch." (lifecycle below)
Future agents must never mistake an old guess for established reality.

### Decision lifecycle
`proposed → accepted → implemented → (canonical)`; later:
`superseded | reversed | deprecated` — always as **new events**, never edits.
"Canonical" is a historical assertion, supersedable like any other.

## 5. Work graph schema

**Mission** `{id, title, objective, acceptance[], status, ownerIds[]}`
contains **Work items** `{id, missionId, parentId?, title, status, owner?,
acceptance?, links:[{rel, other, ts}], evidence[]}`.

- Status: `todo → doing → review → done`; `blocked` anytime with a reason.
- Relations: `blocks`, `depends_on`, `supersedes`, `part_of` (subdivision).
- Agents **claim work**, not files; file reservations derive from work claims —
  conflict prevention happens *before* edits (same work twice, overlapping
  scopes, symbol collisions, contradictory decisions), not at merge time.
- Completion requires **evidence** (receipts): tests, hashes, screenshots,
  build outputs, deployment ids — linked from the work item.

## 6. Mission rooms (the live operating room)

- Every mission has a persistent room. Rooms survive disconnects; agents
  rejoin with full history. Presence: `online|away|offline` + heartbeat.
- **Semantic message kinds** (not just chat): `message`, `announcement`,
  `request`, `response`, `obligation`, `delegation`, `discovery`, `blocker`,
  `review_request`, `handoff`. The orchestrator can see *Agent 7 is waiting on
  Agent 4* — structured, not two text bubbles.
- Room talk is **coordination, not truth**: important findings get *promoted*
  to durable objects (Discovery, Decision, Invariant, Failure, Handoff).
- Handoffs are executable: current state, verified evidence, unfinished work,
  blockers, and the **next exact safe action** — mostly by transferring the
  Work Item itself, not prose.

## 7. Provenance (automatic, at the tool boundary)

When an agent touches a file or runs a significant action, the tool wrapper
records the objective part automatically:

```
{ts, tool, agentId, sessionId?, missionId?, workId?, entityId,
 beforeHash?, afterHash?, outcome, summary}
```

The agent then adds the semantic part: intent, decision refs, outcome notes.
History never depends on an agent remembering to journal. Per-file "who/why"
timelines are projections of this record.

## 8. Context compiler (context capsules)

On task start the system compiles a **capsule** — layered, token-budgeted:

1. `laws` (mandatory — never summarized away, never dropped)
2. `objective` 3. `canonical_decisions` 4. `active_work` 5. `blockers`
6. `peer_obligations` 7. `recent_discoveries` 8. `known_failures`

Budget algorithm: fill in priority order; truncate/drop lowest-priority
non-mandatory layers first to fit `budgetTokens`. `PROJECT_CONTEXT.md` is a
*compiled artifact* of this process — regenerable, never the source of truth.
Canonicality attaches to individual decisions/outcomes, never whole sessions.

## 9. Capabilities & trust

- Sharing is **capability-based**, not all-or-nothing: read project, write
  under path, create work, join room, run tests, request deploy, propose
  contribution — each grantable separately. History itself is append-only
  (no capability deletes the past).
- Contributors are humans **and** agents, attributed in history.
- Federated agents join missions under narrow capabilities: assignment +
  capsule in, evidence/artifacts out, room-scoped communication.

## 10. Sharing / forking / contributions

Publish a workspace (private → invite → org → link → public), optionally with
history/decisions/context — not just files. Others **fork the working
intelligence environment**: files + architecture + decisions + context +
runnable artifacts. Improvements return as **contributions** (AI pull
requests) with full evidence; owners accept/reject piece by piece.
Public folders with `index.html` get Preview/Publish (Pages-equivalent).

## 11. UI map (v0.1 → forward)

- `#/` — home: clean grid (Missions, Agents, Files, Shared, Recent) + universal search palette.
- `#/mission/<id>` — tabs: **Overview** (objective, acceptance, progress,
  blockers, next action, agents, evidence) · **Work** (issues-like cards,
  filters, deps) · **Agents** (roster: specialty, assignment, health, history)
  · **Room** (semantic stream + presence + composer) · **Files** (who/why
  timelines) · **Decisions** (lifecycle + supersede chains) · **Activity**
  (causal event feed) → later: Evidence, Tests, Releases, Deployments,
  Knowledge, Graph.
- Later: causal-graph visualization, time-machine scrubber, smart folders
  (saved queries like `/Smart/All Mitzvah World terrain work/`), old-session
  reconstruction ("find all Mitzvah World work, make a project").

## 12. Storage & sync path

- **v0.1 (now):** local-first. Event log + entity store in the browser
  (localStorage key `awtsmoos.workos.v1`). Zero server changes, zero tunnel
  impact. Single-user, but the *model* is already the real one.
- **v0.2:** server event log (append endpoint + seq assignment), multi-device
  sync, room realtime over the existing tunnel transport (transport ≠ identity;
  the tunnel work happening in parallel must not be disturbed).
- **v0.3:** federation — cross-user rooms, fork/contribute protocol,
  capability tokens.

## 13. API surface

- v0.1: the `WorkOS` JS namespace (`core/store.js`) — see `CONTRACT.md`.
- v0.2 (sketch): `POST /workos/events:append`, `GET /workos/events?since=`,
  `GET /workos/entities/:id`, WS `room.subscribe(roomId)` with
  resume-from-seq. Server assigns authoritative `seq`; clients keep causal
  `causes[]`.

## 14. Phased rollout

1. ✅ v0.1 — local core (events/entities/work/missions/rooms/provenance/
   capsule) + UI shell + seed demo. (this build)
2. v0.2 — server event log + sync + realtime rooms; agent roster + heartbeat service.
3. v0.3 — context compiler v2 (embeddings-assisted retrieval, still
   graph-first), smart folders, universal search.
4. v0.4 — sharing/fork/contribute, capabilities, public pages.
5. v0.5 — federation, reliability scoring from evidence, self-improving teams.

## 15. Open decisions for Yaakov

1. **Name:** "WorkOS" is the working title — keep it?
2. **Server home:** should v0.2's event log live inside the existing geelooy API server, or as its own service?
3. **Public by default?** New missions: private-first (current assumption) vs. shareable-first.
4. **Agent identity across sessions:** one persistent agent identity per "role" (e.g. "Sela the builder") vs. fresh identity per session?
5. **History retention:** truly infinite append-only, or compaction rules for ancient low-value events (with tombstone receipts)?

---
*The deepest primitive is durable work history. Everything else is a projection.*
