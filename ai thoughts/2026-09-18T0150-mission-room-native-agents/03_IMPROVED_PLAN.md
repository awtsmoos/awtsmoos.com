<!-- B"H -->
# Improved Mission Room Plan

1. Reproduce room create + agent delegates + status/audit on a disposable Mission.
2. Locate the outer Mission-aware response composer that turns action output into advisory/gate envelopes.
3. Build one room-native presentation contract exposing missionId, roomId, roomStatus, deterministic agentRoster, counts, and room-local next instructions.
4. Make explicit requested missionId authoritative for the outer envelope.
5. Bridge legacy `missionAgent*` operations into canonical room state while retaining compatibility fields for existing callers.
6. Keep core Mission planning/protocol actions unchanged.
7. Suppress generic Mission self-interrogation for successful room administration unless the room itself reports a blocking interrupt.
8. Add focused regression for unrelated Mission gate hijack.
9. Add stable-roster tests across create/join/delegate/sync/audit/reload and duplicate calls.
10. Run existing room creation, dozens-agents, fanout, liveness, routing, scheduler, forced-gate, and collaboration compatibility suites.
11. Live-test multiple real delegated agents and verify room roster/inbox without answering unrelated Mission protocol questions.
