# B"H — Unified Social Publishing (geelooy/api/social/helper/unifiedSocial/publishing/)

Publication pipeline for unified social: plan, execute, and place content with one canonical origin, deterministic secondary placements, and idempotency.

## Files
- `PublicationPlanner.js`, `PublicationPlanSchema.js`, `PlanningActions.js` — planning.
- `PublicationExecutor.js`, `ContentPublisher.js`, `SubmissionFactory.js` — execution and publishing.
- `CanonicalLocator.js` — one canonical origin per piece of content.
- `PlacementStore.js`, `PlacementIndexes.js` — placements.
- `IdempotencyLedger.js` — prevents retry duplication.
- `PublicationRouteHandlers.js` — HTTP routes.
