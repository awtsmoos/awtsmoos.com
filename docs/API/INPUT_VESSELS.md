B"H
Boruch Hashem
Blessed is He

# API Input Vessels

The Awtsmoos clothes one request in path, query, body, cookie, header, identity, and state;
Awtsmoos.com separates these vessels so a human knows what data belongs to which gate.

## `$i` — request/runtime context

Derech modules commonly receive `$i`, a server-created context. Depending on the handler it can expose request metadata, URL/path information, parsed data vessels, route variables, authenticated identity, database access, response helpers, and family-specific utilities. `$i` is not client JSON and is not a URL segment.

## Route variables

Dynamic route patterns use colon syntax such as `:alias`, `:postId`, `:host`, or `:blobId`. The router populates the captured variables for the handler. See [../ROUTES/DYNAMIC_PATHS.md](../ROUTES/DYNAMIC_PATHS.md).

## `$_GET`

Parsed query/input data. It commonly carries filters, pagination, search controls, optional identifiers, and route-specific read parameters. A source reading `$_GET` does not prove the HTTP method is exclusively GET.

## `$_POST`

Parsed submitted/body data. Create, update, action, provider, and control-plane handlers frequently use it. The exact content type and required fields remain route-specific.

## `$_DELETE`

Delete-oriented parsed input used in a number of Social and related mutation flows. It is a data vessel, not proof that the route accepts only DELETE.

## Headers

Headers carry identity/provider/protocol evidence in several systems. Important examples include Authorization bearer credentials, Awtsmoos API keys, Origin, WebSocket upgrade headers, content type, and provider-specific metadata. The generated source-contract index records statically visible header names where the scanner can prove them.

## Cookies and signed session state

Authentication installed by the dynamic server can populate trusted request user state from session evidence. Client-submitted body fields must not be substituted for this trusted identity.

## Database and server state

`$i.db` and related server state are injected capabilities, not caller-controlled input. They matter when understanding side effects but should never appear in an external API request example.

## Generated evidence

[../GENERATED/API_SOURCE_CONTRACTS.md](../GENERATED/API_SOURCE_CONTRACTS.md) labels source files that lexically reference GET/POST/DELETE vessels, route variables, headers, cookies, identity, or DB access. This is a source-level map, not a formal per-endpoint schema.
