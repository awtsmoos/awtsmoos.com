B"H

# Pass 1 Discovery

User asks for Mission tool / Mission Rooms to reveal all tools, pulling truth from apps/tunnel/control routes rather than guessing. They also want live stream / live effects organized by current chat, and Mission view should include a Codex/Claude style readable table showing which agent is issuing which tunnel commands.

Known from previous pass:
- Tunnel Control app root is geelooy/apps/tunnel-control.
- Mission rooms code lives under js/features/missionRooms/*.
- Live stream code likely lives under js/features/live.js and css/future/views/live.css.
- Tool list truth may live in backend route code under geelooy/api/tunnel/control or docs/OpenAPI files.

Discovery tasks:
1. Locate backend tunnel control route/action registry.
2. Inspect mission project status/discover payload shape for action history or agent command traces.
3. Inspect live stream feature and app action catalog for existing action/tool metadata.
4. Plan small modules, full-file rewrites only.
