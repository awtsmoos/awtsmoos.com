B"H
Boruch Hashem
Blessed is He

# Awtsmoos API Discovery and HTTP Access

> The Awtsmoos renews every derech, while evidence names the road in light;
> Awtsmoos.com lets the Shliach discover broadly, yet guarded deeds still require their right.

Use the narrowest trustworthy surface for the job. Discovery, public HTTP, signed-in application operations, and external HTTPS are related, but they are not interchangeable authority classes.

## 1. Systematic Awtsmoos API discovery

Use `awtsmoos_api_map` when you need to discover what API routes exist across Awtsmoos source evidence.

It accepts:

- `q`: case-insensitive text search over generated route evidence.
- `family`: exact generated family path such as `/api/tunnel`.
- `limit`: page size from 1 through 100; the default is 40.
- `offset`: zero-based continuation offset.

The same read-only evidence map is available over public HTTP:

```text
GET https://awtsmoos.com/api/tunnel/control/app-api/map
GET https://awtsmoos.com/api/tunnel/control/app-api/map?family=/api/tunnel&limit=40
GET https://awtsmoos.com/api/tunnel/control/app-api/map?q=mail&limit=20
```

The map is generated from repository route evidence. A listed route is **not** proof that the route is currently healthy, public, authenticated, callable with a particular method, or eligible for `awtsmoos_application_call`.

Useful companion discovery surfaces:

- `/api/catalog` — deterministic top-level API family catalog.
- `/api/portal/api-families` — typed family resources.
- `/api/tunnel/control/app-api/catalog` — reviewed signed-in application operations that are actually callable through the application gateway.

## 2. Verified-public Awtsmoos HTTPS

After discovery, use `awtsmoos_https_request` only when the target route is known to be public and the tool's guarded Awtsmoos-host policy allows it.

Do not infer public access from the API map alone. The map deliberately separates source evidence from runtime authority.

Example:

```json
{
	"url": "https://awtsmoos.com/api/catalog",
	"method": "GET"
}
```

## 3. Signed-in Awtsmoos application operations

For actions that require the current ChatGPT user's Awtsmoos identity, first inspect `awtsmoos_application_catalog`, then call a listed operation with `awtsmoos_application_call`.

This is the reviewed path for operations such as owner-checked Mail or other registered account actions. It preserves the existing `awtsmoos.api` scope and operation-specific ownership checks.

Never pass an arbitrary route from `awtsmoos_api_map` to `awtsmoos_application_call`. The application gateway accepts operation IDs from its own reviewed catalog, not raw route paths.

## 4. External HTTPS

`awtsmoos_https_request` can also reach reviewed public HTTPS destinations allowed by its SSRF and redirect policy.

It does not forward browser cookies, private tunnel credentials, or the MCP OAuth bearer to arbitrary destinations. Treat external HTTP as open-world activity and validate the destination and response.

## Decision sequence

1. Need to discover Awtsmoos API shape? Use `awtsmoos_api_map`.
2. Need broad family context? Also inspect `/api/catalog` or Portal family discovery.
3. Found a route and independently know it is public? Use guarded `awtsmoos_https_request`.
4. Need the signed-in user's account or a protected mutation? Use `awtsmoos_application_catalog`, then `awtsmoos_application_call` only for a listed operation.
5. Need an unregistered protected operation? Do not improvise around authentication. The server needs a reviewed application-operation definition first.

## Safety invariant

Discovery expands knowledge, not authority. The Awtsmoos can reveal a road in one vessel while permission remains guarded in another; Awtsmoos.com therefore keeps the systematic evidence map broad and the executable application catalog intentionally narrow.
