B"H
# Component Split Plan

## Desired module shape after inspection
Prefer small complete modules. Rewrite whole files only. Split any large module rather than surgically replacing fragments.

Candidate target structure:

```text
js/features/missionRooms/
  index.js
  api/
    discover.js
    join.js
    messages.js
    history.js
    status.js
  roomList/
    cards.js
    render.js
    controller.js
  roomView/
    render.js
    members.js
    messages.js
    activity.js
    composer.js
  state/
    roomState.js
    polling.js
```

## First-class state
- `rooms[]`
- `selectedRoomId`
- `roomStatusById`
- `messagesByRoomId`
- `activityByRoomId`
- `membersByRoomId`
- `pollHandle`

## Strict removals
The Mission Rooms initial render must not contain:
- Tool Catalog
- Tunnel Tools
- Tool Filter
- Live Calls
- Command Stream
- Room tunnel calls
- command rows/tables

## Compatibility strategy
Keep public exports that existing boot code imports, but route them into the new room-first controller. Do not break navigation wiring unless evidence proves a different entry point.

The first room card is a gate of quiet glass. Only when opened may the storm of tools whisper from inside, already tamed into room history.
