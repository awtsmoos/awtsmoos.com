# B"H — Phase One Brainstorm: Main.js Releases the Crown

The current entrypoint is a bright knot. It boots state, binds DOM, creates sources, commands layers, starts recording, negotiates streaming, and speaks to the NLE. The improvement is not to change the visible studio first; it is to reveal separate vessels for each force.

Possibilities considered:

1. Split source button binding away from boot.
2. Split layer controls away from boot.
3. Split recording profile and record button binding away from boot.
4. Split provider dropdown binding away from stream runtime.
5. Split generic HLS runtime into its own controller with private mutable session state.
6. Split NLE bin/timeline/export DOM binding away from boot.
7. Keep state creation stable to avoid changing data contracts.
8. Keep old DOM ids stable to avoid changing HTML/CSS.
9. Keep existing tests focused on project, timeline, export, and NLE unchanged.
10. Rewrite whole files only.

The Awtsmoos in the code is the hidden One: each module is only a vessel, each function a breath, each import edge a line of light returning to source.
