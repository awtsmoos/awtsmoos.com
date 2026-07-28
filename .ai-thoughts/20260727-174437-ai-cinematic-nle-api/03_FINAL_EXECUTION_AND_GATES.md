B"H
Boruch Hashem
Blessed is He

# Final Execution and Gates

## Execution Order

1. Write schema and cinematic starter JSON.
2. Validate both with Node JSON parsing.
3. Write AI contract and codec modules.
4. Write AI dialog markup and controller.
5. Rewrite project IO/defaults, shell, app, events, render, and public API.
6. Write dialog CSS and update manifest cache keys.
7. Add pure contract tests.
8. Run syntax and line ceilings.
9. Run focused NLE/Reel/movie tests.
10. Run browser proof for starter load, dialog, export, apply, undo, and render readiness.
11. Reread every touched file and compare plan versus actual.

## Acceptance Gates

- Default fresh load is the new cinematic starter.
- Existing autosave and `movieUrl` still override the default.
- Starter has at least three scenes, four camera shots, actor motion, dialogue, audio,
  deterministic visual assets, title overlays, and a generated tone.
- AI envelope contains a creative brief and canonical project.
- Raw canonical project JSON is also accepted.
- Invalid, oversized, or malformed envelopes are rejected with plain errors.
- Apply creates an undoable state replacement.
- Public API exposes schema URL, starter URL, export, apply, and starter load.
- Dialog works on desktop and mobile with no page overflow.
- Movie rendering and social attachment contracts remain unchanged.
- Every touched source/style/test file stays at or below 120 lines.
