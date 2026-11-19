# B"H — Awtsmoos knowledge, Ask, Heichelos and Mail through the Shliach

The Awtsmoos renews every public word. Awtsmoos.com allows reading without a website account, and writing only with the actual owner's consent.

## Public / guest reading

The public Awtsmoos website supports browsing [Heichelos](https://awtsmoos.com/heichelos/ikar), [Ask](https://awtsmoos.com/ask/) and public content without a website session. In the **ChatGPT Awtsmoos Shliach plugin**, use the `awtsmoos_public_query` MCP tool. The plugin itself still requires an authorized `tunnel.read` OAuth connection, but neither website login nor `awtsmoos.api` is required for this read-only tool. It sends no bearer tokens or website cookies to the target.

Examples:

```json
{"action":"search","query":"Torah","limit":10}
```

```json
{"action":"ask","question":"What is a heichel?"}
```

```json
{"action":"heichel","heichel":"ikar"}
```

For additional browsing, use `heichelos_by_alias` with `alias`, `series` with `heichel` and `series`, `posts` with `heichel` and `series`, or `post` with `heichel`, `series` and `post`. `search_exact` searches the exact Hebrew corpus with `query` and optional `corpus`. `ask_sources` queries the available `/ask` source collections. Optional `session` and `sources` on `ask` are bounded and validated.

Public actions have no mail, posting, private database or indexing capability. The dangerous `/ask/api` `action:index` is never accepted by the plugin.

**Availability is not fabricated:** if the live site returns HTTP 503 because its library source catalog is not verified, report that status. Exposing the tool does not create missing index data.

## Signed-in Awtsmoos operations

Use `awtsmoos_application_catalog` to discover registered operation IDs, scopes and parameters. Use `awtsmoos_application_call` with `operation`, `params`, `query` and `body`. This requires the `awtsmoos.api` OAuth scope. Server application handlers validate the authenticated account, alias ownership, and Heichel editor permissions. Never forge a website cookie or borrow an unrelated alias.

The catalog includes existing `posts.create`, `posts.update` and `posts.delete`, plus `heichel.create`, `series.create`, and five Awtsmoos Mail operations.

To create an authorized Heichel:

```json
{"operation":"heichel.create","params":{"alias":"<owned-alias>"},"body":{"heichelId":"sample-heichel","name":"Sample Heichel"}}
```

To create a series:

```json
{"operation":"series.create","params":{"heichel":"<heichel-id>"},"body":{"aliasId":"<owned-alias>","name":"Sample Series"}}
```

To send mail **only when the user actually intends to send it**:

```json
{"operation":"mail.send","params":{"toAlias":"<recipient>","fromAlias":"<owned-alias>"},"body":{"subject":"Shalom","content":"B\"H"}}
```

The real Mail service checks `fromAlias` ownership. Mailbox actions `mail.inbox`, `mail.get`, `mail.unread` and `mail.settings` similarly require a valid owned alias. Never call `mail.send` for a test or without the user's intended recipient and message. External mail requires an explicit `toEmail` and configured outgoing service.

## External HTTPS APIs

Use `awtsmoos_https_request` for bounded external public HTTPS and its process-local per-user/per-destination quotas. It separately requires `awtsmoos.api`. OAuth bearer credentials are never forwarded implicitly. See `HTTP_API_ACCESS.md` for the complete request schema and restrictions.
