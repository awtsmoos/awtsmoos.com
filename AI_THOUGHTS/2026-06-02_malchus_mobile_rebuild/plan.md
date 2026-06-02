B"H
# Malchus Mobile Rebuild Plan

The current page imports many old CSS owners after the ideal files, so the new mobile design keeps being overwritten. The screenshots prove that the sidebar is transparent/stacked, auto-scroll overlaps content, A/I controls overlap content, and multiple panels visibly fight.

Inspected:
- `geelooy/heichelos/post/_awtsmoos.post.html`
- `geelooy/heichelos/post/styles/main.css`
- `geelooy/heichelos/post/styles/ideal/*`
- `geelooy/heichelos/post/logic/listeners/SidebarGate.js`
- `geelooy/heichelos/post/logic/listeners/AutoScrollButton.js`
- `geelooy/heichelos/post/tabs/manager/*`
- `geelooy/heichelos/post/logic/initialization/sidebarContent.js`

Decision:
- Rebuild the post reader CSS from a small, final import list.
- Stop importing the old conflicting feature CSS from `main.css`.
- Create complete, small CSS modules under `styles/ideal/reborn/`.
- Each module owns one layer: tokens, shell, reader, sidebar, panels, actions.
- Keep selectors scoped to `.post-reader-localized-context.awtsmoos-reader-vision`.

Files to rewrite/create fully:
1. `geelooy/heichelos/post/styles/main.css`
2. `geelooy/heichelos/post/styles/ideal/reborn/tokens.css`
3. `geelooy/heichelos/post/styles/ideal/reborn/shell.css`
4. `geelooy/heichelos/post/styles/ideal/reborn/reader.css`
5. `geelooy/heichelos/post/styles/ideal/reborn/sidebar.css`
6. `geelooy/heichelos/post/styles/ideal/reborn/panels.css`
7. `geelooy/heichelos/post/styles/ideal/reborn/actions.css`

Verification:
- Check every new CSS file exists and is under safe size.
- Run CSS import ownership/quality tests if available.
- Run static grep to prove `main.css` no longer imports old conflicting CSS.
- Run node syntax checks for sidebar/auto-scroll manager JS to ensure CSS-only rebuild did not touch executable paths.
