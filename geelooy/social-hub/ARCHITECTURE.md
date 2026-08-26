B"H

# Social Hub Architecture Covenant

> The Awtsmoos is beyond interface and implementation, yet every vessel on Awtsmoos.com receives a measured boundary. This document explains those boundaries so future expansion remains simple, retractable, testable, and free of accidental cascade or API entanglement.

## Surface ownership

The Social Hub owns the root class `.social-hub-document`. Route-local CSS must place every selector beneath that root. Importing a stylesheet only from Social Hub is not enough: selector locality is a contract, not a convention.

`style.css` is the only route stylesheet entrypoint. It composes small focused modules with `@import`; page HTML should not accumulate route-specific style tags or parallel CSS entrypoints.

## Interaction hierarchy

Primary navigation and creation actions stay visible. Secondary routes move into the mobile More sheet. Expert coordinates live inside progressive disclosures. This keeps ordinary flows calm without deleting advanced capability.

Every relevant interactive control must have focus-visible and active feedback. Hover enhancement is restricted to devices that actually support hover. Reduced-motion, reduced-transparency, and forced-color preferences retain function without decorative dependence.

`future-interaction-baseline.css` is the route safety net. Component styles may become richer, but no new control may arrive without a visible interaction state.

## Mobile and overflow

Flex and grid children that may carry long text use `min-inline-size: 0`. Media and controls stay within their owning surface. The product does not hide layout defects with a global `overflow-x: hidden`; overflow must be prevented at the owning component.

The More sheet uses native dialog top-layer behavior. Its internal sticky header uses a small local z-index only; new arbitrary page-wide z-index escalation is forbidden.

## API foundation

`DomemApiFoundation.js` owns route roots, safe dynamic coordinates, and query grammar.

`YesodApiGateway.js` extends Domem with read/write/remove behavior. Reads can carry timeout, abort, and header options just like mutations, so route transitions can cancel stale work without inventing new API clients.

`ApiGatewayFoundation.js` remains a compatibility doorway that re-exports both classes. Existing domain imports therefore remain stable while implementation responsibilities stay small.

`ApiTransportFoundation.js` owns fetch mechanics, body encoding, timeout, cancellation, and network failure translation. Feature APIs should describe domain data, not repeat transport machinery.

## Verification gates

Run these after Social Hub changes:

- `node geelooy/social-hub/tests/localStyleOwnership.test.mjs`
- `node --test geelooy/social-hub/js/api/ApiFoundation.test.mjs`
- `node geelooy/social-hub/tests/futureInteractionContract.test.mjs`
- `node geelooy/social-hub/tests/futureMobileRouteVisibilityBrowser.test.mjs`
- `node geelooy/social-hub/tests/browserSmoke.test.mjs`

Browser verification must include 390px mobile and desktop widths, zero document overflow, route reachability through More, focus restoration, reduced-motion behavior, and an empty console-error ledger.

## Expansion rule

Shared abstractions graduate upward only after multiple real surfaces prove the same requirement. Locality comes first. Reuse follows evidence. This keeps the UI simple outside, precise inside, and stable enough for the next revelation.
