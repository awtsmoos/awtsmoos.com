# B"H — Implementation Slice Plan

## Evidence found
- The hosted API route table registers `live-calls`, conversations, previews, and FS bridge routes.
- Main API persistence currently reads/writes `geelooy/.data/tunnel-control.json` synchronously through `core/store.js`.
- Conversation history is inside that same store and bounded, but still full-file rewrite.
- Live calls read conversation snapshots and do not persist separate live-call streams.
- Mission rooms are implemented as native tunnel mission actions in `missionActions.js` and collaboration data in `mission/collaboration.js`.
- Collaboration currently includes agents, messages, user messages, delegations, claims, heartbeats, audits, settings, and invites.
- The app shell already collects panes and has home/workspace mode, but the home still includes side rail in the shell and landing/install panels before the grid.

## Files to touch now
1. `geelooy/apps/tunnel-control/js/dashboard/dashboard.js`
   - Rewrite whole file into a fullscreen Mission Control OS grid: no install strip, no link strip, no paged dashboard, just hero/status and direct cards.
2. `geelooy/apps/tunnel-control/css/future/views/mission-control-os.css`
   - New scoped CSS: hide rail in home mode, make home fullscreen grid, disable landing scroll feel, keep workspace pages dedicated after card click.
3. `geelooy/apps/tunnel-control/css/future/index.css`
   - Rewrite whole import file to include the new CSS module.
4. `geelooy/apps/tunnel-control/ai-thoughts/.../06-implementation-readback.md`
   - Record readback and verification.

## Why this slice
This directly addresses the core user-facing defect: "one giant scrolling dashboard". It preserves existing feature modules, avoids breaking API auth or agent mission actions, and creates a stable landing OS from already discovered page registry data.
