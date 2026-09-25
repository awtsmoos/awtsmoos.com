B"H
# Geelooy Revelation Architecture

## Product law
Revelation v4 is the shared visual/interaction foundation. It supplies tokens, focus, touch, surfaces, motion, responsive behavior and reduced-motion law without forcing every route into identical chrome.

## Shell ownership
- **OS** alone owns the desktop metaphor: windows, dock, start surface and command shell.
- **Workspace/application routes** use the shared Geelooy application shell exactly once.
- **Editorial, landing and reader routes** may remain bespoke, but should inherit Revelation foundations where useful without mounting duplicate global navigation.
- **Server-rendered Heichelos routes** retain their real template ownership; tests must inspect `_awtsmoos.*` composition instead of pretending every route is static HTML.

## Shared layers
1. `geelooy/style/revelation-v4/` — global design behavior and tokens.
2. `geelooy/style/geelooy-app/` — application-shell surfaces.
3. `geelooy/style/social-system/` — social/editor primitives.
4. Small route adapters — route identity only, not duplicate design systems.

## Progressive disclosure
Primary work stays immediately visible. Advanced destination, publication, infrastructure, administration and destructive controls remain reachable underneath More, details, context menus or dedicated owner surfaces. Capability is hidden progressively; it is not deleted.

## Source discipline
- Keep new/touched source <=120 lines when practical.
- Split by responsibility instead of compressing functions.
- Preserve IDs, data attributes and backend routes before changing presentation.
- Prefer shared semantic tokens over duplicated hard-coded design concepts.
- Do not resurrect deprecated Home/dashboard generations to satisfy obsolete witnesses.

## Current major ownership
- Home: bespoke landing + Revelation foundation.
- OS: desktop shell.
- Files: OS program with simple-first disclosure.
- Drive/Social/Composer/Mail/Profile/Notifications/Apps: shared app-shell consumers.
- About/Login: focused bespoke routes; Login inherits Revelation auth foundations.
- Heichel reader: bespoke reader chrome.
- Heichel directory/workspace/editor: server/shared ownership according to the current template composition.
