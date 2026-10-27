B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/heichelos/:heichel/series/:series/changePostsInSeries

**Family:** API Root · **Mount:** `/api` · **Derech health:** OK

**Source:** `geelooy/api/social-legacy-archive/old/_awtsmoos.series.js` · **Discovery:** static-literal · **Confidence:** source-lexical

[Read the human API Root tutorial](../../../TUTORIALS/API/ROOT_API.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: `GET`, `POST`
- Request vessels: `$_GET`, `$_POST`
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
curl -X GET 'https://awtsmoos.com/api/heichelos/{heichel}/series/{series}/changePostsInSeries'
```

```js
const response = await fetch("/api/heichelos/{heichel}/series/{series}/changePostsInSeries", {
	method: "GET"
});
const result = await response.json();
```

## Observed callers

No matching literal caller evidence was found.

## Related tests

Heuristic family matches:

- `test` — `npm run test:routes && npm run test:treasury && npm run test:treasury:full && npm run test:imported-style-ownership && npm run test:css-quality && npm run test:heichelos-quality && npm run test:heichel-cache-scale && npm run test:profile-menu && npm run test:heichel-governance && npm run test:post-submissions && npm run test:comments && npm run test:api-keys && npm run test:graph && npm run test:social-content && npm run test:notifications && npm run test:social-packed && npm run test:packed-engine && npm run test:platform-ops && npm run test:platform-execution && npm run test:node-client && npm run test:dayuh-cutover`
- `test:dayuh-release` — `npm run test:routes && npm run test:comments && npm run test:social-content && npm run test:social-packed && npm run test:packed-engine && node --test tools/dayuhChadashMaintenance/test/*.test.js && npm run test:dayuh-cutover`
- `test:routes` — `node geelooy/api/social/test/routeCoverage.test.js`

## Related routes

- [`/api`](./api-caf1672720.md)
- [`/api/asdfg`](./api-asdfg-9e43b7d9e7.md)
- [`/api/catalog`](./api-catalog-80c2586373.md)
- [`/api/even/:asd/more/:rt/k`](./api-even-asd-more-rt-k-feb231eb24.md)
- [`/api/heichelos/:heichel/addContentToSeries`](./api-heichelos-heichel-addcontenttoseries-cda5c16063.md)
- [`/api/heichelos/:heichel/addNewSeries`](./api-heichelos-heichel-addnewseries-6c167f7390.md)
- [`/api/heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment`](./api-heichelos-heichel-aliases-alias-commentsactions-addcommentin-4141eb36ea.md)
- [`/api/heichelos/:heichel/aliases/:alias/commentsActions/updateAllCommentIndexes`](./api-heichelos-heichel-aliases-alias-commentsactions-updateallcom-a68539ccb3.md)
