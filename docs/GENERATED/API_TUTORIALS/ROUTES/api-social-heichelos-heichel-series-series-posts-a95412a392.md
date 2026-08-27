B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/social/heichelos/:heichel/series/:series/posts

**Family:** Social · **Mount:** `/api/social` · **Derech health:** OK

**Source:** `geelooy/api/social/_awtsmoos.posts.base.js` · **Discovery:** static-literal · **Confidence:** source-lexical

[Read the human Social tutorial](../../../TUTORIALS/API/SOCIAL.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: `GET`, `PUT`
- Request vessels: `$_GET`, `$_POST`, `$_DELETE`, `route-vars`
- Observed status literals: —
- Observed headers: —

## Path parameters

| Name | Shape |
| --- | --- |
| `heichel` | single segment |
| `series` | single segment |

## Starter call

> Starter only: method evidence is lexical at the source-file level; inspect the handler before relying on payload or response shape.

```sh
curl -X GET 'https://awtsmoos.com/api/social/heichelos/{heichel}/series/{series}/posts'
```

```js
const response = await fetch("/api/social/heichelos/{heichel}/series/{series}/posts", {
	method: "GET"
});
const result = await response.json();
```

## Observed callers

No matching literal caller evidence was found.

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
