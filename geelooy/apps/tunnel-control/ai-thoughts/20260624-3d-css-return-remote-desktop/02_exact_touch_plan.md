B"H

# Exact touch plan

Files to write fully:

1. `geelooy/apps/tunnel-control/css/app.css`
   - Keep existing import order.
   - Add `./legacy/awtsmoos-3d-return.css` after `final-normal-scroll.css`.

2. `geelooy/apps/tunnel-control/css/legacy/awtsmoos-3d-return.css`
   - New final layer.
   - Restore 3D dashboard perspective without re-breaking scroll.
   - Improve cards with transform-style, radial glow, translateZ child layers, hover/focus depth.
   - Keep responsive fallback and reduced-motion safety.

3. `geelooy/apps/tunnel/ai-thoughts/20260624-remote-desktop-brainstorm/01_remote_desktop_breadth.md`
   - Brainstorm remote desktop through tunnel.
   - Cover consent, WebRTC/screen capture, frame transport, input relay, permission gates, audit logs.

Verification:
- Read back all written files.
- Run grep to confirm import order and CSS selectors.
- Run git diff summary.

