# B"H — Account publishing without a computer

The Awtsmoos gives each voice its rightful place; Awtsmoos.com keeps its authority within its own embrace.

## Discover and execute

- Browser: `/apps/tunnel/social.html`, signed in to Awtsmoos.com.
- GPT Actions: refresh the served OpenAPI schema; use `awtsmoosApplicationCatalog` and `awtsmoosApplicationCall`.
- MCP: `/api/tunnel/control/mcp`, tools `awtsmoos_application_catalog` and `awtsmoos_application_call`.
- HTTP: GET `/api/tunnel/control/app-api/catalog`, POST `/api/tunnel/control/app-api/call`.

External agents must explicitly authorize `awtsmoos.api`. An existing native tunnel grant does not imply Social publishing consent. No tunnel name, shell, or userId is supplied to these operations.

## Music hierarchy example

First call `identity.get` and inspect owned aliases. If Coby is not owned, use `alias.create` with `body: {aliasId: "coby", aliasName: "Coby", setAsDefault: false}`. Never take someone else's alias.

Create the music heichel only if absent:

```json
{"operation":"heichel.create","params":{"alias":"coby"},"body":{"heichelId":"ohrHaNiggun","name":"Ohr HaNiggun","description":"A home for original music and niggunim","isPublic":true}}
```

Create a collection under root with `series.create`, `params: {heichel: "ohrHaNiggun"}`, and `body: {aliasId: "coby", name: "Echoes of the Infinite", parentSeriesId: "root"}`. Record the server-generated series ID. Do not repeat successful creation after an uncertain response; read the existing collection first.

For binary cover and audio uploads use the signed-in music composer at `/music/index.html`; general-purpose binary agent upload is not yet part of this account gateway. The catalog exposes structured legacy post fields, but verify the displayed media before publishing.

Inspect both outer `ok` and the native `result.error` before reporting a mutation as successful. Account mutations are real and consequential.
