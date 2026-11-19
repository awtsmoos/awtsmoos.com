# B"H — Awtsmoos Shliach: public, logged-in and external HTTPS APIs

The Awtsmoos renews each request; Awtsmoos.com honors the caller's actual permissions.

## Three simple choices

**1. Public Awtsmoos API:** Call `awtsmoos_https_request` with `mode: "awtsmoos-public"` and a public route. No site session or OAuth bearer is forwarded to the target. This endpoint has been verified to return JSON over HTTPS:

```json
{"mode":"awtsmoos-public","url":"/api/tunnel/install/bundle-manifest","method":"GET"}
```

**2. Logged-in Awtsmoos application API:** First call `awtsmoos_application_catalog` to discover registered operations and their parameter schemas. Then call `awtsmoos_application_call` with the `operation`, required `params`, and permitted `body`, for example an authorized `posts.create` operation. The server invokes the **real** Awtsmoos application handler under your connected account and enforces alias ownership and application permissions. This is not arbitrary browser-cookie impersonation. Uncataloged private API routes require a reviewed operation addition.

**3. External public HTTPS API:** Call `awtsmoos_https_request` with `mode: "external"`, a full HTTPS URL, and optionally an explicit method, headers, query or body. For instance:

```json
{"mode":"external","url":"https://api.github.com/repos/awtsmoos/awtsmoos.com","method":"GET","headers":{"accept":"application/json"}}
```

For an external provider requiring its *own* API key, provide an explicitly intended `authorization` or `x-api-key` header. Never copy the Awtsmoos MCP bearer. Cookies, proxy headers, Host overrides, local/private network destinations and redirects are prohibited. All HTTPS connections validate the public DNS address and TLS hostname.

## Permissions, quotas and safety

Even when the target API route is public and needs no website login, the **plugin MCP connection itself still requires its authenticated OAuth resource**. Generic HTTPS and logged-in application operations require the `awtsmoos.api` scope. The `tunnel.read` connection minimum is not sufficient for those operations.

External and public HTTPS calls allow GET, HEAD, POST, PUT, PATCH, and DELETE, with an explicit 64 KiB request-body limit, 256 KiB response limit and 10-second socket timeout. Responses are text or JSON; no automatic redirect, browser cookie, compression or binary download.

Quota: **30 requests/account/minute** and **12 requests/account/destination/minute**, returning `rate_limited` and `retryAfterSeconds` on excess. The initial implementation is **process-local**; it is *not* a distributed global rate-limit service. A destination's own rate limit also applies independently.

## Recommended usage

Use public mode for routes anyone can open; use the existing catalog and call pair for real signed-in application actions; use external mode for third-party HTTPS. If a user asks for a signed-in Awtsmoos route absent from the catalog, add a reviewed operation mapping rather than forwarding a fake browser cookie or removing its permission checks.
