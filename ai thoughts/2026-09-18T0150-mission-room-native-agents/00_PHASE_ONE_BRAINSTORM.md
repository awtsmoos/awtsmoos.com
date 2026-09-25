<!-- B"H -->
# Phase One — Shared Mission Room Brainstorm

The Awtsmoos renews every messenger, but Awtsmoos.com must expose one room truth: one Mission, one stable room roster, many agents, no accidental substitution by an unrelated advisory Mission.

## Direct live evidence
- Disposable `missionStart` created `mission_mu6aujbs_f43eac690e` while the outer envelope pointed at unrelated advisory `mission_mu6au4jg_1490b8a421`.
- `missionRoomCreate` for the correct Mission succeeded, but the outer envelope instructed `missionAnswer` for `q_mu6auxnw_f6488209d8` instead of exposing room operations.
- `missionRoom*` actions use the newer `roomEngine` / `roomState` subsystem.
- `missionAgentSync`, `missionAgentDelegate`, `missionAgentAudit`, and peers use legacy `collaboration.js` state.
- Therefore room creation and agent delegation currently have two competing rosters plus a generic Mission-next envelope that can hijack successful room responses.

## Target architecture
1. One canonical room roster backs room and agent APIs.
2. Explicit missionId from the requested action always wins over session/advisory Mission fallback.
3. Successful room administration returns roomId, deterministic roster, ownership, and executable next instructions directly.
4. Only a true room-local blocking user message/interrupt may create a mandatory gate.
5. Legacy collaboration remains a compatibility projection, never a second authority.
6. Join/delegate/sync/audit are idempotent, generation-aware, reload-safe, and easy to understand.
