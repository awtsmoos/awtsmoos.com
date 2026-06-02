B"H

# AI Studio Completion Plan

## User request
- Run real Vibe coding / MiniMax tests.
- Add an optional AI assistant that can be opened anywhere, separate from the Vibe Code tab.
- Use existing AST parser context so the assistant can complete a function, rewrite a file, or give suggestions and ideas.
- Include a good settings UI.

## Safety
- The API key was provided by the user for this test. Do not print it in summaries or write it into repo files.
- Run syntax and local integration tests without exposing secrets.
- If a live API call must be made, use a transient runtime path and redact output.

## Implementation strategy
- Add new small modules under `js/ai-studio/`:
  - `settings.js` localStorage-backed optional feature settings.
  - `context.js` gathers active tab, editor code, selection, cursor, and AST summary.
  - `oracle.js` wraps `VibeAPI.streamChat` for whichever active model/key the app has configured.
  - `panel.js` builds the assistant modal and actions.
  - `index.js` public facade.
- Wire an action `open-ai-studio` through the action registry.
- Add menu and command palette entries.
- Avoid touching the huge settings file; the AI Studio has its own settings UI inside its modal.

## Verification
- `node --check` all new and changed files.
- Static grep for action/menu/palette wiring.
- Run a direct MiniMax smoke request with redacted output if possible.
