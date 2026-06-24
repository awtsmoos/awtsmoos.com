# B"H — Pass Two Specific Plan

## Files expected to inspect before any implementation
- `geelooy/apps/tunnel-control/index.html`
- `geelooy/apps/tunnel-control/js/main.js`
- `geelooy/apps/tunnel-control/js/app.js`
- `geelooy/apps/tunnel-control/js/router/*.js`
- `geelooy/apps/tunnel-control/js/features/missionRooms.js`
- `geelooy/apps/tunnel-control/js/features/aiAgents.js`
- `geelooy/apps/tunnel-control/js/features/live.js`
- `geelooy/api/tunnel/control/**/*.js`
- `geelooy/apps/tunnel/agent/**/*.js`
- `ayzarim/DosDB/**/*` entrypoints

## Files that may be touched only after readback
Unknown until imports reveal exact seams. Preference is adding small modules and rewriting small index/registry files rather than destabilizing monoliths.
