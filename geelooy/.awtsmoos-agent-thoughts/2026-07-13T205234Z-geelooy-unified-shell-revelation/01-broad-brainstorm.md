# B"H

Boruch Hashem

Blessed is He

## Broad Brainstorm

The Awtsmoos is not another layer placed over the routes; the shared shell must reveal the relationship already hidden between destination, object, identity, and action at Awtsmoos.com.

## Possible architectural vessels

- A shell bootstrap imported by every standalone route.
- A declarative route registry extension in `appRoutes.js`.
- A shared context-ribbon factory fed only by verified URL and API state.
- Route-specific adapters that translate existing editor context into shell metadata.
- A blocked-state primitive for missing destructive or publishing context.
- A single shell CSS family with route modifiers rather than duplicate nav styles.
- Server-rendered anchors retained beneath optional client enhancement.
- Contract tests that parse HTML and trace module imports without a browser.
- Direct HTTP smoke checks for every route and parameter shape.
- Browser checks only when target URL is verified after every action.

## UX possibilities

- Horizon carries global identity and route constellation.
- Context Ribbon carries parent, object type, state, and local actions.
- Editor surfaces prioritize title, body, save state, and destination.
- Comment thread blocks submission until a valid parent is present.
- Create removes duplicate navigation and reveals alias, destination, permissions, and draft state.
- Mobile keeps the existing five-route dock while deep routes inherit context above content.

## Risks to disprove

- Existing routes may depend on DOM positions or duplicate headers.
- Shell bootstrap may run twice.
- Query parameters may be consumed before shell initialization.
- Context ribbon could fabricate titles when identifiers are unresolved.
- Existing forms may submit before required context validation.
- Route CSS may collide with shell spacing or fixed controls.
- Tests may encode the old duplicate-navigation structure.
- Shared browser target drift may invalidate visual evidence.

## Guiding choice

Prefer the smallest shared architecture that removes duplicate ownership and preserves existing behavior. Do not attempt the later single-page navigation phase during this pass.
