B"H

# Data-flow plan

Need real evidence before more UI edits:
1. Search mission actions in backend docs/action registry.
2. Search actionHistory actions implementation in tunnel/native side.
3. Inspect conversationStore and liveCalls to understand whether live events include missionId/conversationId/room ids.
4. Inspect mission storage to see data shape for collaboration messages, agents, claims, delegations, timeline, evidence.
5. Write architecture report before implementation.

Implementation after evidence:
- Remove calls table until state.selectedMissionId exists.
- Render room list first always.
- Only after selected room: render room workspace.
- Activity inspector hidden/collapsed, scoped to selected missionId.
