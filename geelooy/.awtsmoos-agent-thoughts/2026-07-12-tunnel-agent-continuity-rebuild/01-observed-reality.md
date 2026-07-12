# B"H — Observed Reality

## Mission

Build a tunnel platform in which many AI conversations can share one local agent without response crossover, collaborate through durable rooms, survive interruption, and present a coherent control surface on desktop and mobile.

## Direct evidence

- The native tunnel is connected as `awt-awtsmoos-2113` with read, write, command, and Chrome capabilities.
- Tunnel Control already contains a future CSS system, a legacy CSS system, mission-room modules, runtime-mesh modules, agent views, and a modular shell.
- `css/app.css` imports future and legacy layers together, allowing old selectors to override the newer design.
- `js/ui/mount.js` contains a duplicate import and duplicate function declaration, showing that an older boot path is not build-clean.
- Mission-room UI already supports room discovery, join, user messages, continue messages, WebSocket, EventSource, and polling fallback.
- Mission actions already cover collaboration, claims, delegation, heartbeats, inboxes, interruption recovery, watchdogs, loops, and finalization gates.
- `missionDaemonStart` reports success without starting a scheduler.
- Mission mutation paths do not share one transaction lock, and the existing promise-map cleanup compares the wrong promise object, leaking lock entries.
- A `shellCommand` request was served as `commandStart` and rejected by correlation checks.
- A `commandWait` request received a different job, command, and project from another concurrent agent.
- A `mkdirp` request received another agent's command response.
- The shared Chrome target was replaced by another agent while this session was inspecting Tunnel Control.
- The relay stores unsolicited responses as completed responses, does not persist valid late responses for retry, and permits a retry to replace an existing pending resolver.

## Non-negotiable invariants

1. A response may resolve only the request whose complete correlation identity it satisfies.
2. An invalid or unsolicited response is quarantined and never consumes a valid pending request.
3. Repeated requests with one control request ID coalesce; they never overwrite each other or resend blindly.
4. Every mission mutation for one mission executes serially, while unrelated missions remain concurrent.
5. Long-running work uses durable leases, receipts, heartbeats, and resumable chunks rather than one endless HTTP request.
6. Human room messages can pause, steer, approve, reject, or resume agents without destroying mission state.
7. Browser targets and command workers are leased to explicit agent/session identities.
8. UI state derives from real runtime state; decorative success labels cannot substitute for an active scheduler.
9. Existing unrelated repository changes remain untouched.
10. Every changed source file is fully rewritten, formatted with tabs in code, and verified by focused tests.
