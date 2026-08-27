B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/social/migrations/posts/v2/run

**Family:** Social · **Mount:** `/api/social` · **Derech health:** OK

**Source:** `geelooy/api/social/_awtsmoos.migrations.js` · **Discovery:** static-literal · **Confidence:** unknown-method

[Read the human Social tutorial](../../../TUTORIALS/API/SOCIAL.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: **unknown**
- Request vessels: `$_GET`, `$_POST`
- Observed status literals: —
- Observed headers: —

## Path parameters

None.

## Starter call

No executable starter is generated because method evidence is unknown. Inspect the source handler before choosing a method or payload.

## Observed callers

Pattern-compatible evidence only; it does not prove runtime dispatch.

| Literal | Source | Kind |
| --- | --- | --- |
| `/api/social/migrations/posts/v2/run` | `geelooy/heichelos/heichel/modules/test/platformOpsApi.test.mjs` | test |

## Related tests

Heuristic family matches:

- `test` — `npm run test:routes && npm run test:treasury && npm run test:treasury:full && npm run test:imported-style-ownership && npm run test:css-quality && npm run test:heichelos-quality && npm run test:profile-menu && npm run test:heichel-governance && npm run test:post-submissions && npm run test:comments && npm run test:api-keys && npm run test:graph && npm run test:social-content && npm run test:notifications && npm run test:social-packed && npm run test:packed-engine && npm run test:platform-ops && npm run test:platform-execution && npm run test:node-client && npm run test:dayuh-cutover`
- `test:api-keys` — `node geelooy/api/social/helper/test/apiKeys.test.js`
- `test:comments` — `node geelooy/api/social/helper/comments/test/runAllCommentsTests.js`
- `test:concurrency-failure` — `node geelooy/api/social/test/concurrencyFailureStress.test.mjs`
- `test:dayuh-release` — `npm run test:routes && npm run test:comments && npm run test:social-content && npm run test:social-packed && npm run test:packed-engine && node --test tools/dayuhChadashMaintenance/test/*.test.js && npm run test:dayuh-cutover`

## Related routes

- [`/api/social`](./api-social-9fa4891e88.md)
- [`/api/social/abuse/rateLimit/check`](./api-social-abuse-ratelimit-check-0a30b621f8.md)
- [`/api/social/alias/:alias`](./api-social-alias-alias-2cc6a9ba6e.md)
- [`/api/social/alias/:alias/details`](./api-social-alias-alias-details-7e4136898b.md)
- [`/api/social/alias/:alias/heichelos`](./api-social-alias-alias-heichelos-34bfb8e313.md)
- [`/api/social/alias/:alias/heichelos/:heichel`](./api-social-alias-alias-heichelos-heichel-4c7f5ddd08.md)
- [`/api/social/alias/:alias/heichelos/:heichel/ownership`](./api-social-alias-alias-heichelos-heichel-ownership-c2e6e8e020.md)
- [`/api/social/alias/:alias/heichelos/details`](./api-social-alias-alias-heichelos-details-75a049464f.md)
