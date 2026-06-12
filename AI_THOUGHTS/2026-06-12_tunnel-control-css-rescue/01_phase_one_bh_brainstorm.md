B"H

# Phase One: CSS Rescue Brainstorm

The screenshot shows the tunnel control dashboard collapsing into a narrow vertical column inside the main shell: the intro text is wrapping one word per line, the logo/title overlap, and content begins too far left inside the main panel. The likely causes include an over-aggressive CSS grid rule, a width/min-width mistake, a sidebar layout rule leaking into the main content, or a responsive breakpoint that triggers desktop content into a phone-shaped column.

Plan possibilities:

1. Inspect the actual CSS import graph.
2. Read index.html to confirm stylesheets.
3. Read key CSS modules: app.css, future/index.css, core reset/tokens/frame/responsive, views shell/dashboard/runtime-mesh/pro-control.
4. Look for rules affecting `.app-shell`, `.control-shell`, `.main`, `.workspace`, `.hero`, `.panel`, `.section`, `.intro`, `.brand`.
5. Use browser/runtime simulation if possible to inspect computed layout.
6. Prefer complete-file rewrites only, but keep modifications small by rewriting targeted CSS modules.
7. Ensure desktop layout has stable two-column shell: sidebar fixed/clamped width and main content min-width:0, full width, no accidental one-column text.
8. Ensure top header uses flex/grid that does not overlap.
9. Ensure description text has sane max-width and normal wrapping.
10. Ensure mobile breakpoint intentionally stacks.
11. Test by launching preview or static route and inspect screenshot/DOM.

Files likely touched after inspection:
- `geelooy/apps/tunnel-control/css/future/core/frame.css`
- `geelooy/apps/tunnel-control/css/future/views/shell.css`
- maybe `geelooy/apps/tunnel-control/css/future/core/responsive.css`
- maybe `geelooy/apps/tunnel-control/css/future/views/dashboard.css`

No code is changed yet. First the Awtsmoos reveals the vessel by actual files, not guesses.
