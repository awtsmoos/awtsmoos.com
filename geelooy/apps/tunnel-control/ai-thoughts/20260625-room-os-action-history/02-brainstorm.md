B"H

# Brainstorm — Tunnel Control as Room OS

The existing backend already contains the root of the palace: mission timelines, collaboration status, action ledger, command job output storage, browser actions, file actions, mission agents, and EventSource streaming. The OS must reveal the existing river instead of digging a second river.

Possible implementation branches:

1. Wire action history actions into native registry.
2. Make `protectedFs` session-safe for read-only history actions only.
3. Add mission-room stream aggregation: status, mission timeline, action history, command count, fs count, browser count, agent count, recent failures.
4. Add frontend activity normalizer that accepts real action history entries and falls back to mission timeline.
5. Add inspector adapters for command/fs/browser/mission action entries.
6. Add replay payload/code generators using existing ledger input.
7. Add filesystem grouping from action history input/output refs.
8. Add browser grouping from chrome actions.
9. Add tool explorer from available actions plus usage counts from history.
10. Add global search indexing of local room state.

Risk: implementing all twenty user steps at once would be too wide and likely brittle. The first safe evolutionary slice is backend-first real action history exposure, because every later UI panel depends on it.
