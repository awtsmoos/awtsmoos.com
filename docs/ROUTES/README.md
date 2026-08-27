B"H
Boruch Hashem
Blessed is He

# Routes

The Awtsmoos sends a path through filesystem and derech, both visible and concealed;
Awtsmoos.com becomes navigable when URL, parameter, and source are all revealed.

This section explains how to travel from a browser URL to the source that serves it.

## Public filesystem routes

The dynamic server's default public root is `geelooy`. Therefore a public URL such as `/login`, `/os`, `/apps/code`, or `/games/...` normally begins by resolving inside the corresponding `geelooy/...` path. Directory `index.html` files are common entry points, but dynamic derech behavior can intercept or augment a request.

Use [PUBLIC_ROUTES.md](PUBLIC_ROUTES.md) for major human-facing areas and [../GENERATED/PUBLIC_ROUTE_INVENTORY.md](../GENERATED/PUBLIC_ROUTE_INVENTORY.md) for the immediate-directory inventory.

## Dynamic/API routes

Derech files named `_awtsmoos.derech.js` are discovered by walking upward from the request's physical path. A derech can return route definitions with exact path strings or colon parameters. API mounts are inventoried in [../GENERATED/DERECH_MOUNTS.md](../GENERATED/DERECH_MOUNTS.md).

## Dynamic parameters

- `:name` matches exactly one segment.
- A terminal `:name*` captures the remainder.
- Catch-all parameters must be the final route part.
- Dollar-prefixed request variables are not URL syntax.

Read [DYNAMIC_PATHS.md](DYNAMIC_PATHS.md) for the exact distinction.

## URL lookup workflow

1. If the URL starts with `/api/`, search [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md).
2. Otherwise map its first segment to `geelooy/<segment>/`.
3. Look for `index.html`, client scripts, and nested directories.
4. Search ancestors for `_awtsmoos.derech.js` if behavior is dynamic.
5. If the feature uses WebSockets, also inspect `ayzarim/awtsmoosDynamicServer/websocket/`.
6. Use [URL_TO_SOURCE.md](URL_TO_SOURCE.md) for common examples.

## Do not confuse these three things

- **Filesystem URL path** — source location under public `geelooy/`.
- **Derech route pattern** — an exact or colon-parameterized dynamic handler.
- **Request data vessel** — `$i`, `$_GET`, `$_POST`, `$_DELETE`, headers, cookies, body, or auth state.
