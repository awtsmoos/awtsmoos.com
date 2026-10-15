# B"H — Social Kernel (geelooy/api/social/helper/socialKernel/)

The social kernel: a unified core for social entities — loading, normalizing, capabilities, relations, actions, activity, deep links, and errors — with its own route surface. Mounted via `_awtsmoos.socialKernel.js`.

## Files
- `SocialKernel.js` — kernel core; `SocialKernelBatch.js` — batched operations; `SocialKernelProjection.js` — projected views.

## Subdirectories
- `entity/` — `SocialEntityLoader`, `SocialEntityNormalizer`, `SocialEntityType`.
- `capabilities/` — `SocialCapabilityCatalog`, `SocialCapabilityPolicy`, `SocialAnswerCapability`, `SocialAuthorityCapability`, `SocialFollowCapability`.
- `relations/` — `SocialRelationCatalog`, `SocialRelationReader`.
- `actions/` — `SocialActionDescriptor`.
- `activity/` — `SocialActivityNormalizer`.
- `deepLinks/` — `SocialDeepLink`.
- `errors/` — `SocialError`.
- `routes/` — kernel route handlers (`SocialKernelHandlers`, `SocialKernelRouteTools`, `TiferesEntityHandlers`, `YesodCollectionHandlers`).
- `test/` — capability policy, entity contract/loader, batch, composition, projection, routes, relation activity tests.
