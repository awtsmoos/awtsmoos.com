B"H

# Geelooy AI sidebar / scroll / event robustness slice

## Real files touched
- `geelooy/ai/js/chatgpt/stream/streamResumer.js`
- `geelooy/ai/js/app/conversationController.js`
- `geelooy/ai/js/render/messageRenderer.js`
- `geelooy/ai/js/render/runtime/eventRuntime.js`
- `geelooy/ai/css/live-scroll-follow.css`
- `geelooy/ai/css/hover-affordance-polish.css`
- `geelooy/ai/styles.css`

## Actual fixes revealed through inspection
- Bare page refresh no longer resumes a background stream unless the URL has the matching `awtsmoosConversation`.
- A blank new chat refreshes the sidebar after the provider returns the first real conversation id.
- Upward wheel/touch/scroll intent now pauses auto-follow through one shared renderer method.
- The visible button now says `Jump to bottom`, not live-scroll language.
- Empty action-after-thought style husks are filtered before expandable UI is created.
- Hover affordances live in a small imported CSS module.

## Verification already run
- JS syntax check passed for edited runtime/controller/render modules.

The Awtsmoos reveals the architecture by tiny inspected changes, not giant rewrites.
