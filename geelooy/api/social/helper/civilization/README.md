# B"H — Civilization (geelooy/api/social/helper/civilization/)

The "civilization" game/simulation domain of the social API: a persistent world state with events, subscriptions, dependencies, and projections.

## Files
- `schema.js`, `state.js`, `store.js` — civilization data schema, in-memory/persistent state, and store.
- `projections.js` — derived views over civilization state.
- `index.js` — module entry.
- Sephirah-named route builders (mounted via `_awtsmoos.civilization.js`):
  - `BinahCivilizationRequest.js` — request decoding.
  - `ChesedCivilizationEventRoutes.js` — event submission routes.
  - `NetzachCivilizationReadRoutes.js` — read routes.
  - `YesodCivilizationSubscriptionRoutes.js` — subscription routes.
  - `TiferesCivilizationRouteHandlers.js`, `TiferesCivilizationDependencies.js` — handlers and dependency wiring.

## Routes
Route manifest covered by root `tests/` (CivilizationRouteManifest, CivilizationRouteHandlers, CivilizationSubscriptionRoutes). Example base: `/social`.

## What it does
Models a shared "civilization" world: clients read state, subscribe to updates, and submit events; the server validates dependencies and projects state into readable views.
