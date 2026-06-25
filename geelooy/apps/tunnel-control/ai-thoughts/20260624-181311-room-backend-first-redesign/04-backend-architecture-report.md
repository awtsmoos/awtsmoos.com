B"H

# Backend architecture report for Mission Rooms

## What the backend actually has

Mission room data is stored in local mission files under `.awtsmoos/missions/<missionId>/mission.json` inside the tunnel root. Mission actions are implemented in:

- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionActions.js`
- `geelooy/apps/tunnel/agent/tools/fs/mission/core.js`
- `geelooy/apps/tunnel/agent/tools/fs/mission/collaboration.js`

## Room browser source

`missionProjectDiscover` returns:

- `missions[]`
  - `mission: M.report(m)`
  - `collaboration: C.status(m)`
  - `updatedAt`

This is the correct source for the initial page. It should render only room cards.

## Room open source

`missionProjectJoin` joins the selected mission room and returns collaboration status.
`missionProjectStatus` returns the current collaboration status for the selected mission.

`C.status(m)` returns:

- `projectId`
- `missionId`
- `projectRoot`
- `agents[]`
- `messages[]`
- `userMessages[]`
- `openUserMessages[]`
- `openDelegations[]`
- `activeClaims[]`
- `latestAudit`
- `settings`
- `invitePrompt`

This is the correct source for the selected room workspace.

## Room messaging source

Human messages should use `missionRoomUserMessage` through existing `messages.js`. Agent-to-agent messages use `missionAgentMessage`; agent responses use `missionAgentRespond`.

## Activity/history source

Room-scoped full tunnel action history does not exist as a clean backend endpoint yet. Current `live-calls` route reads `conversationStore`, which stores global conversation events. It does not contain `missionId` in its event schema. Therefore it is unsafe to show `live-calls` as room activity unless a strict missionId/correlation field is added.

Available room-scoped activity today:

- `missionTimeline`: returns events from the selected mission only.
- `collaboration.messages`: room messages only.
- `collaboration.claims`, delegations, audits, heartbeats: room collaboration activity only.

Therefore this pass must use `missionTimeline` as the selected-room activity inspector. It should NOT use `live-calls` for Mission Rooms.

## Backend gap

To support full expandable tunnel tool calls per room later, backend should add one of:

1. Add missionId to `conversationStore.recordConversationEvent` event objects whenever a tunnel action happens in a mission context, then filter `live-calls` by missionId.
2. Add an agent-side `missionActivityHistory` action that joins `actionLedger` entries with missionId/agentSessionId/logicalAgentId.
3. Extend `actionHistorySearch` to accept missionId and only return entries whose input/output metadata includes that missionId.

Until that exists, showing global live calls inside a room is wrong.

## Correct frontend data flow

Page opens:
- discover rooms
- render room grid
- no selected workspace unless URL has explicit `room`/`missionId`
- no activity panel visible
- no message composer visible

Click room:
- missionProjectJoin
- missionProjectStatus
- missionTimeline
- render room workspace and collapsed inspector
- poll only this room status/timeline

Switch room:
- replace selected missionId
- clear previous room activity/messages
- join/poll new room only
