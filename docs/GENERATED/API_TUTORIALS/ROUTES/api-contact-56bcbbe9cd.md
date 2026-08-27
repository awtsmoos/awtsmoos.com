B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/contact

**Family:** Contact · **Mount:** `/api/contact` · **Derech health:** OK

**Source:** `geelooy/api/contact/_awtsmoos.derech.js` · **Discovery:** static-literal · **Confidence:** source-lexical

[Read the human Contact tutorial](../../../TUTORIALS/API/CONTACT.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: `POST`
- Request vessels: `$_POST`, `db`
- Observed status literals: —
- Observed headers: `x-forwarded-for`

## Path parameters

None.

## Starter call

> Starter only: method evidence is lexical at the source-file level; inspect the handler before relying on payload or response shape.

```sh
curl -X POST 'https://awtsmoos.com/api/contact' \
  -H 'content-type: application/json' \
  --data '{}'
```

```js
const response = await fetch("/api/contact", {
	method: "POST"
	headers: { "content-type": "application/json" },
	body: JSON.stringify({})
});
const result = await response.json();
```

## Observed callers

Pattern-compatible evidence only; it does not prove runtime dispatch.

| Literal | Source | Kind |
| --- | --- | --- |
| `/api/contact/` | `geelooy/contact/contact.js` | runtime |

## Related tests

No package-script heuristic match was found.

## Related routes

- [`/api/contact/status`](./api-contact-status-078003efb4.md)
