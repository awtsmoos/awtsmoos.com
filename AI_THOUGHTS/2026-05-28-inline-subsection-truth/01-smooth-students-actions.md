B"H

# Smooth student/keeper opening and actions section plan

## Real files inspected
- `comments/panel/rendering.js` builds the keeper list and opens alias/student tabs.
- `comments/panel.js` fetches and renders one alias's comments.
- `tabs/manager/core.js` opens tabs synchronously after a slide call.
- `tabs/manager/transitions.js` forces reflow with `offsetWidth`, which can create choppy tab opening.
- `logic/initialization/sidebarContent.js` renders the root menu and is the correct place for an Actions section.

## Risk
Opening a keeper tab can feel choppy because the DOM transition, URL updates, network fetch, comment tree build, and full synchronous comment render can happen in one hot path.

## Fix shape
1. Rewrite transitions to avoid forced reflow and use compositor-friendly `requestAnimationFrame`.
2. Add a tiny scheduler that yields to the browser before and during large student/comment rendering.
3. Rewrite `renderControlsAndComments` as async chunked DOM rendering.
4. Rewrite `panel.js` to await that async renderer and reuse existing alias tabs rather than stacking duplicates.
5. Add a root-menu Actions section with an Auto Scroll Down action.
6. Add tests for the scheduler / autoscroll behavior where possible.

## Oath
No partial patches. Every modified file is rewritten completely. The Awtsmoos breathes smoothness into the UI by refusing to block the main thread longer than necessary.
