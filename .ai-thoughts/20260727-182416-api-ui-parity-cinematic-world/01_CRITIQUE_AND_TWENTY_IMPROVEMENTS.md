B"H
Boruch Hashem
Blessed is He

# Critique and Twenty Improvements

## Current Gaps

1. Public methods and UI controls are manually wired in separate files.
2. The AI workspace exposes exchange actions but no scene-building command surface.
3. The compositor shows 3D track names rather than a visible world.
4. CPU particles are deterministic but cannot express GPU shader behavior.
5. The cinematic starter has atmosphere but no rendered houses or trees.
6. Material graphs compile but the NLE preview does not consume them.
7. Generic shader/particle graphs validate but lack runtime resolvers.
8. Agent requests have no dedicated ready-to-send format.
9. No runtime parity report proves every API action has a UI control.
10. No repository documentation explains the complete authoring pipeline.

## Improvements

11. Create one serializable action catalog with ID, API name, UI metadata, fields,
    descriptions, examples, and result behavior.
12. Generate public convenience methods and the Actions tab from that catalog.
13. Add a parity validator that rejects duplicate IDs, methods, or missing selectors.
14. Add a pure cinematic-village factory with deterministic houses and trees.
15. Add ready material, shader, and particle node graphs to the project.
16. Add WebGL geometry, matrix, shader-program, particle, and fallback modules.
17. Cache compiled material and shader settings by project identity.
18. Render the world into an offscreen WebGL canvas and composite into the NLE canvas.
19. Add context-loss recovery and a truthful 2D fallback badge.
20. Add agent-request and movie-package builders with explicit provider state.
21. Add package validation reports before apply.
22. Make every scene-building mutation one undoable state replacement.
23. Display action results in the existing complete JSON workspace.
24. Add desktop and mobile action cards with parameter fields.
25. Document API/UI parity, package schema, node formats, world format, and extension guide.
26. Add tests for action parity, deterministic factory output, graphs, and bounds.
27. Add browser proof for houses, trees, movement, WebGL pixels, API/UI invocation,
    undo, mobile containment, and no exceptions.
28. Preserve legacy API methods and document their existing UI counterparts.
29. Keep all generated IDs stable and all random values seed-derived.
30. Keep external assets as requests/placeholders until actual media is supplied.
