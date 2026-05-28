B"H

# Multi-chat automation and payload certainty plan

## User reports
- Second automation now mostly works but still sometimes has errors.
- Need stronger proof that page automation payload is exactly the same as manual Send.
- Automation settings must be per conversation, default off for each chat.
- Switching chats must show that chat's settings.
- Multiple chats should be able to automate independently, including multiple browser tabs and multiple chats from the same tab.
- Graph tab/instructions are too confusing; make simpler.
- Add a simple prompt list that automation can cycle through randomly.
- Checkbox/toggle styles are poor.

## Ground rules
- Read real files first.
- Rewrite complete files only.
- Keep page automation through `controller.send(prompt)` and do not add automation markers into ChatGPT POST payload.
- Add tests that compare manual and automation paths at the central controller/service boundary, not just string checks.

## Work sequence
1. Inspect automation settings/panel/graph/runStore/continuationGate and ChatGPT send payload builder.
2. Patch per-conversation settings store.
3. Update index wiring to reload panel settings on chat switch/new chat and save settings by active conversation.
4. Add simple prompt-list/random prompt support in pipeline and panel.
5. Improve graph UI copy and drag/drop instructions without heavy feature work.
6. Fix toggle/checkbox CSS.
7. Add payload parity tests and per-conversation settings tests.
8. Run focused harness and `npm run test:ai`.
