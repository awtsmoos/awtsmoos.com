B"H

# Phase One — Chesed Brainstorm: The Largest Useful Animator Universe

The Awtsmoos gives possibility without measure; Awtsmoos.com receives it as a vessel of craft. This pass names the broadest useful future without pretending each idea already exists in the code beneath our raft.

## Capability Universe

1. Scene graph with nested groups, characters, props, cameras, masks, and layers.
2. Rigged characters with bones, constraints, attachment points, deformers, and reusable pose libraries.
3. Expression system with brows, eyelids, pupils, cheeks, jaw, lips, head tilt, squash, stretch, and emotion blending.
4. Dialogue timing with phonemes/visemes, syllable emphasis, jaw openness, lip rounding, blinking, gaze, head nods, and breathing cues.
5. Motion tracks for transform, bone, expression, camera, opacity, filters, and custom properties.
6. Data-defined easing, interpolation, loops, holds, anticipation, overshoot, follow-through, and secondary motion.
7. Gesture recipes: wave, point, shrug, nod, walk, run, idle, breathe, laugh, think, speak, react, and turn.
8. Camera language: pan, truck, zoom, dolly simulation, shake, focus framing, shot presets, safe areas, and transitions.
9. Timeline authoring with clips, beats, markers, dialogue, keyframes, curve presets, snapping, and layered motion.
10. Reusable character templates and style packs without binding the core engine to one drawing style.
11. AI/agent command surface where an agent can describe a scene as structured data rather than imperative DOM manipulation.
12. Deterministic schema validation so agent output fails clearly before corrupting a project.
13. Small recipe API: create project, add character, set expression, speak line, gesture, move camera, render preview.
14. Advanced API: custom tracks, procedural behaviors, reusable motion graphs, import/export adapters.
15. Local project persistence with explicit versioning and migration boundaries.
16. Export pathways aligned with what the existing runtime can truly support: frames, canvas, video hooks, or data export.
17. Performance budgets: only dirty layers redraw; animation time is centralized; large projects avoid accidental quadratic work.
18. Mobile-first UI: stage-centered, thumb-friendly primary actions, retractable inspector/timeline/library, no side panel permanently stealing width.
19. Desktop expansion: keyboard shortcuts, richer timeline, multi-selection, inspector drawers, precision inputs.
20. Accessibility: focus-visible, full keyboard reachability, ARIA state, touch targets, reduced motion, readable contrast.
21. Professional state feedback: selected, hover, focus, active, disabled, loading, saving, invalid, empty, success.
22. Local CSS architecture: one animator root namespace, component-level stylesheet imports, zero unbounded selectors.
23. Layout invariants: `min-width:0`, bounded scroll containers, deliberate stacking scale, safe-area support, no accidental fixed overlays.
24. Agent onboarding document with copy-paste minimal JSON, one high-level command example, one advanced timeline example, error table, version note.
25. Self-describing runtime API exposed through a single stable namespace rather than hidden globals.
26. Contract tests for public agent API and scene schema.
27. Visual smoke tests for narrow phone, tablet, desktop, and reduced-motion modes.
28. Browser console verification and layout overflow audit.
29. Sample cartoons that demonstrate expression, lip movement, body motion, camera, and timing from data alone.
30. Extensibility points that permit future renderers, input adapters, and behavior packs without changing the scene domain.

## Five Competing Architectures

### A — Monolithic Studio Rewrite
Fast conceptual reset, but dangerous compatibility blast radius and poor fit with the 120-line modularity law.

### B — Data Kernel + Adapters + UI Shell
A stable scene/timeline domain, adapters around existing render/runtime code, and a separate retractable UI shell. Strongest balance of compatibility and expansion.

### C — Plugin-First Everything
Maximum extensibility, but too much infrastructure before proving basic scene workflows.

### D — Canvas Runtime Rewrite
Potential rendering purity, but high risk if current app relies on SVG/DOM or existing renderer contracts.

### E — Legacy UI Polish Only
Low risk but violates the mission because API, motion semantics, and agent ergonomics would remain weak.

## Preferred Direction
Architecture B unless inspection reveals that the existing app already contains a stronger equivalent. Preserve public contracts through adapters, let the new data model become the central ohr, and let renderers/UI become keilim receiving it.
