# B"H — Public Awtsmoos Ask, Heichelos and signed-in Mail

The Awtsmoos renews every public word. Awtsmoos.com permits public reading without a website session, and writing only with actual account permission.

## Public / visitor reading

Browse [Heichelos](https://awtsmoos.com/heichelos/ikar), [Ask](https://awtsmoos.com/ask/) and public content on the website without signing in. In the **ChatGPT Awtsmoos Shliach plugin**, use `awtsmoos_public_query` with a resource-authorized `tunnel.read` connection. The plugin itself requires OAuth but **a separate Awtsmoos website login or `awtsmoos.api` scope is not required** for this tool. It sends neither the MCP bearer nor website cookies outbound.

```json
{"action":"heichel","heichel":"ikar"}
```

```json
{"action":"search","query":"Torah","limit":10}
```

```json
{"action":"ask","question":"What is a Heichel?"}
```

Other public reads: `heichelos_by_alias` (`alias`), `series` (`heichel`, `series`), `posts` (`heichel`, `series`), `post` (`heichel`, `series`, `post`), `search_exact` (`query`, optional `corpus`), and `ask_sources`. Optional `session` and `sources` on `ask` are bounded and validated. Guest actions never grant posting, sending mail, private database access, or indexing. The privileged `/ask/api` `action:index` is not accepted.

## Verified partial historical Ask and Ikar navigation

A separate, real read-only historical index is online while the full current library remains unavailable. Use the following three extra `awtsmoos_public_query` actions:

```json
{"action":"ask_index_status"}
```

```json
{"action":"ask_indexed","query":"Genesis"}
```

```json
{"action":"ikar_search","query":"Bereshit"}
```

These are **not full-library search**. At the 2026-11-19 read-only audit, only **128 of 27,387 historical passages** were indexed (`complete:false`). The Ikar bridge returns actual observed series names and URLs, but its post-body and untagged-source coverage is incomplete. Always disclose these coverage limits and cite returned source links. The independent `/api/social/search/library/query` service returned HTTP 503, and `ask_sources` reported an unverified source catalog; see [Issue #11](https://github.com/awtsmoos/awtsmoos.com/issues/11). Do not fabricate results or trigger `action:index` to conceal the unavailable source catalog.

## Signed-in writing and Awtsmoos Mail

Call `awtsmoos_application_catalog` to discover registered operation IDs, scopes and parameter descriptions. Call `awtsmoos_application_call` with an `operation`, `params`, `query` and `body`. These authenticated actions require the `awtsmoos.api` OAuth scope. Their actual Awtsmoos site handlers enforce account identity, alias ownership and Heichel edit permission; the plugin does not forge browser cookies.

Available original post operations include `posts.create`, `posts.update` and `posts.delete`. Additional authenticated operations include `heichel.create`, `series.create`, `mail.send`, `mail.inbox`, `mail.get`, `mail.unread` and `mail.settings`.

Create a Heichel, only under your authorized alias:

```json
{"operation":"heichel.create","params":{"alias":"<owned-alias>"},"body":{"heichelId":"sample-heichel","name":"Sample Heichel"}}
```

Create an authorized series:

```json
{"operation":"series.create","params":{"heichel":"<heichel-id>"},"body":{"aliasId":"<owned-alias>","name":"Sample Series"}}
```

Send Mail **only when the user expressly intends that message and recipient**:

```json
{"operation":"mail.send","params":{"toAlias":"<recipient>","fromAlias":"<owned-alias>"},"body":{"subject":"Shalom","content":"B\"H"}}
```

The real Mail service verifies ownership of `fromAlias`. Inbox, message, unread and settings calls verify the reading alias. External delivery requires an explicit `toEmail` and an authorized configured outgoing mail service. Never send real Mail or create public posts for tests without the user's intended content and recipient.

## External HTTPS APIs

Use `awtsmoos_https_request` for public third-party HTTPS. It separately requires `awtsmoos.api` and an explicit target URL. The plugin never forwards OAuth bearers implicitly. The HTTPS gateway enforces TLS/DNS destination validation, request/response size limits and process-local caller/destination quotas. See `HTTP_API_ACCESS.md` for the complete API contract.
