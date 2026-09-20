# WorkOS v0.1 — JS Integration Contract
<!-- B"H | Boruch Hashem | Blessed is He -->

The **only** surface the UI may call. Core exposes it as the global `WorkOS`
namespace (plain scripts, load order: `util → events → entities → graph →
work → rooms → provenance → capsule → seed → store`).

`WorkOS.version === "0.1.0"`

## Conventions

- Entity ids: `awts://entity/<kind>/<uid>` · Event ids: `evt_<uid>` ·
  `uid()` = base36 time + 6 random chars (`core/util.js`).
- Event envelope: `{id, seq, ts, type, actor:{kind:"human"|"agent"|"system",id,name?}, entity:null, mission:null, work:null, room:null, causes:[], data:{}}`
- Persistence: browser `localStorage["awtsmoos.workos.v1"] = {events:[], entities:{}}`; in-memory fallback when `localStorage` is undefined (node).
- Token estimate: `ceil(chars/4)`.

## Events

`events.append({type, actor, entity?, mission?, work?, room?, causes?, data?}) → event`
`events.list({type?, typePrefix?, mission?, work?, room?, entity?, actorId?, since?, limit?}) → newest-first`

Types: `fact.file_mutated|fact.test_passed|fact.test_failed|fact.command_exited|fact.http_status|fact.deployed|fact.agent_read_files` · `claim.made` · `decision.proposed|accepted|implemented|superseded|reversed|deprecated` · `work.created|status_changed|blocked|unblocked|delegated|completed|linked` · `mission.created|status_changed` · `room.created|message|presence` · `agent.registered|heartbeat` · `file.created|renamed|edited` · `provenance.recorded`.

## Entities

`entities.register(kind, {name, attrs?, pathAliases?}) → {id, kind, name, createdTs, attrs:{}, pathAliases:[]}`
`entities.get(id) → entity|null`
`entities.find(kind, q?)` — case-insensitive name substring, sorted by name.
`entities.rename(id, newName, newPath?)` — id stable; old address → `pathAliases`; emits `file.renamed` for kind `"file"`.

## Missions

`missions.create({title, objective, acceptance?}) → entity` (+ `mission.created`)
`missions.get(id)` · `missions.list()`
`missions.overview(id) → {mission, progress:{total,done,pct}, blockers[], agents:[{agent,status,currentWork}], recentActivity[8], decisions[], openRequests[]}`

## Work

`work.create({missionId, title, owner?, acceptance?, parentId?}) → entity` (attrs `{missionId, status:"todo", owner:null, acceptance:"", parentId:null, links:[]}`)
`work.get(id)` · `work.list({missionId?, status?, owner?})`
`work.setStatus(id, status, {note?, evidence?})` — status ∈ `todo|doing|blocked|review|done`; emits `work.status_changed` (+ `work.blocked|unblocked|completed` on entering those).
`work.link(aId, bId, rel)` — rel ∈ `blocks|depends_on|supersedes|part_of`; emits `work.linked`.

## Rooms

`rooms.create({missionId, name}) → entity` (+ `room.created`)
`rooms.post(roomId, {author, msgKind, body, to?}) → event` — msgKind ∈ `message|announcement|request|response|obligation|delegation|discovery|blocker|review_request|handoff`
`rooms.history(roomId, {limit=100})` — oldest-first
`rooms.setPresence(roomId, agentId, status)` — status ∈ `online|away|offline`
`rooms.presence(roomId) → [{agentId, name?, status, ts}]` (latest per agent)

## Provenance

`provenance.record({tool, agentId, entityId?, summary, intent?, beforeHash?, afterHash?, outcome?, data?}) → event`; also appends `{ts, tool, summary, outcome, beforeHash, afterHash}` to `entity.attrs.history[]`.

## Context capsules

`capsule.compile({missionId?, workId?, agentId?, budgetTokens=4000}) → {layers, totalTokens, text}`
Layers by priority: `laws` (mandatory) · `objective` · `canonical_decisions` · `active_work` · `blockers` · `peer_obligations` · `recent_discoveries` · `known_failures`.
Fit: truncate/drop lowest-priority non-mandatory first; mandatory never dropped. `text` joins layers under `## <name>` headers.

## Graph & convenience queries

`graph.related(entityId, {depth=2}) → {nodes, edges:[{from,to,rel}]}`
`facts.list({entity?, mission?, limit?})` · `claims.list(...)` · `decisions.list({mission?, status?})` → one aggregated object per title: `{title, status, mission, ts, seq, rationale, supersedes, eventId}` (`status` = latest `decision.*` suffix per `data.title`)

## Lifecycle

`WorkOS.reset()` · `WorkOS.seed()` (idempotent demo world: "Tunnel Hardening — v0.1" mission, 6 work items, 3 agents + human, semantic room, decisions incl. a superseded one, facts/claims, provenance, file entities with history).
