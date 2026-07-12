# B"H — Final File Plan

## Read before writing

- Mission-room frontend controller, state, render, events, API helper, and CSS.
- Daemon scheduler, state, status, actions, and tests.
- Mission lock and storage helpers.
- Command-job store if readable.

## Expected new backend files

- `mission/continuation/defaults.js`
- `mission/continuation/normalize.js`
- `mission/continuation/decision.js`
- `mission/continuation/store.js`
- `mission/continuation/actions.js` or a small action-group module
- Focused tests under `actionGroups/test/`

## Expected new frontend files

- `features/agentControls/state.js`
- `features/agentControls/render.js`
- `features/agentControls/events.js`
- `features/agentControls/controller.js`
- `css/future/views/agent-controls/*.css`
- Focused DOM test.

## Existing files likely rewritten

- Mission daemon scheduler and status facade.
- Mission action builders or group registry.
- Mission Rooms render/controller integration.
- Future CSS index.
- Dashboard runtime board integration if resource health belongs there.

## Completion proof

The pass is complete only when repeated pause/resume/start/stop cycles leave zero timers, zero queued transactions, no duplicate observers, and authoritative policy state survives reload.
