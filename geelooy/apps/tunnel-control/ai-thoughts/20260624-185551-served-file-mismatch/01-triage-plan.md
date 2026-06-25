B"H

# Served file mismatch triage

The backend missionProjectDiscover works through the tunnel action tool. The browser still shows stale frontend files from `/apps/tunnel-control/js/...`:
- public `missionRooms/api.js` is old direct `getJson` implementation
- public `api/tunnel.js` lacks mission actions in SESSION_OK_ACTIONS

Therefore the current bug is likely static serving / wrong file path / cache mismatch, not mission backend failure.

Plan:
1. Locate every `apps/tunnel-control/js/features/missionRooms/api.js` under the repo.
2. Locate the static route that serves `/apps/tunnel-control`.
3. Compare served file path with edited file.
4. Patch the actually served source, or route/static cache, with full-file writes only.
5. Verify browser fetch sees updated files, then reload Mission Rooms and confirm cards appear.
