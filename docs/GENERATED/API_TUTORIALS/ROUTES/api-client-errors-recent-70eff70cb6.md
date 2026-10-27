B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/client-errors/recent

**Family:** /api/client-errors · **Mount:** `/api/client-errors` · **Derech health:** OK

**Source:** `geelooy/api/client-errors/_awtsmoos.derech.js` · **Discovery:** static-literal · **Confidence:** source-lexical

[Read the human /api/client-errors tutorial](../../../TUTORIALS/API/README.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: `POST`
- Request vessels: `$_POST`, `headers`
- Observed status literals: `400`, `429`, `500`
- Observed headers: —

## Path parameters

None.

## Starter call

> Starter only: method evidence is lexical at the source-file level; inspect the handler before relying on payload or response shape.

```sh
curl -X POST 'https://awtsmoos.com/api/client-errors/recent' \
  -H 'content-type: application/json' \
  --data '{}'
```

```js
const response = await fetch("/api/client-errors/recent", {
	method: "POST"
	headers: { "content-type": "application/json" },
	body: JSON.stringify({})
});
const result = await response.json();
```

## Observed callers

No matching literal caller evidence was found.

## Related tests

Heuristic family matches:

- `test` — `npm run test:routes && npm run test:treasury && npm run test:treasury:full && npm run test:imported-style-ownership && npm run test:css-quality && npm run test:heichelos-quality && npm run test:heichel-cache-scale && npm run test:profile-menu && npm run test:heichel-governance && npm run test:post-submissions && npm run test:comments && npm run test:api-keys && npm run test:graph && npm run test:social-content && npm run test:notifications && npm run test:social-packed && npm run test:packed-engine && npm run test:platform-ops && npm run test:platform-execution && npm run test:node-client && npm run test:dayuh-cutover`
- `test:node-client` — `node --check geelooy/scripts/awtsmoos/api/social/nodeClient.mjs`

## Related routes

- [`/api/client-errors`](./api-client-errors-8db468b3a0.md)
