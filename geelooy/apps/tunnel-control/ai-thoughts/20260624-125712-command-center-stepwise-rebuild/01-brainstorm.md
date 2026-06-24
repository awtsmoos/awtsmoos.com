B"H

# Brainstorm: make Tunnel Control one command center

Goal: no app-inside-app, no sidebars, no floating diagnostics, no trapped scroll. One scrollable document. Home becomes compact command center. Mission Rooms becomes the core. Live becomes a command activity table. Tools become a searchable command palette/codex. Project explorer should feel like a simple tree with preview. Developer traces appear inline only.

Step sequence:
1. Stabilize frame and normal scroll with final override already present.
2. Compact home dashboard so many cards fit without weird clipping.
3. Mission Rooms: rooms first, selected room immediately below, advanced/codex hidden behind details.
4. Live: table-first event activity, grouped by chat/room, no sidebar.
5. Tools: expose all tunnel actions in one searchable codex.
6. Project explorer: tree/list first, preview second, no card soup.
7. Developer mode: no floating diagnostics; inline trace/details only.

Risks:
- Existing JS modules may assume old IDs; preserve IDs for buttons/inputs.
- Existing tests only assert render basics; keep selectors stable.
- CSS import order: final-normal-scroll must remain last.
