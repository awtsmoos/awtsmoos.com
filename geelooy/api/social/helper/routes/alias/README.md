# B"H — Alias Routes (geelooy/api/social/helper/routes/alias/)

Alias and user-alias HTTP routes: alias details, ownership, sites, and ID generation.

## Files
- `userRoutes.js` — `/user/:user/aliases*` routes.
- `collectionRoutes.js`, `entityRoutes.js`, `operations.js` — collection/entity/operation routes.
- `publicSiteRoute.js` — public site route.
- `test/` — `PublicSiteRoute.test.js`.

## Endpoints
- `/aliases`, `/aliases/:alias[/details|ownership|sites]`, `/aliases/details`, `/aliases/checkOrGenerateId`
- `/alias/:alias[/details|ownership|sites]`, `/alias/default`
- `/user/:user/aliases`, `/user/:user/aliases/:alias[/details]`
