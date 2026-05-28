B"H

# Automation regression emergency plan

## User-observed failure
Automation toggle is visible, but when enabled it adds/briefly shows a user message, then refreshes/resets the chat and no automation continuation actually happens. The user expects automation to behave exactly like the user sending the same prompt repeatedly, with background support only as an ownership/runtime detail.

## Rule
Do not continue feature work. Debug automation from first principles. Keep extension-backed basic loading intact.

## Suspected path
1. UI toggle calls AutomationPanel.captureAutomation.
2. index.js onChange calls syncBackgroundAutomation.
3. backgroundBridge chooses extension when window.awtsmoosFetch exposes automation methods.
4. jected.js sends automation-start with config.
5. bgAutomation/api.js calls engine.startAutomation(msg.config || {}). Potential mismatch: page sends payload fields {settings, graph, conversationId, chatgptMode, chatgptModePayload}, but background API passes only msg.config, and jected wraps the payload as config. Need verify shape actually reaches engine.
6. engine should send ChatGPT POST exactly like user with parent resolution and should not reload visible conversation destructively.

## Immediate reads
Read bgAutomation engine, chatgpt sender, pageDelegate, graph, storage, turnState, backgroundBridge, backgroundStreamMirror, and tests.

## Reproduction targets
- Browser status if possible: automation status, local storage settings, visible URL, last console errors.
- Unit/harness that simulates page bridge payload shape, not just static strings.

## Patch rules
Rewrite complete files only. Keep modules under practical size. Add focused tests proving extension automation start payload reaches engine and uses existing conversation id/settings prompt.
