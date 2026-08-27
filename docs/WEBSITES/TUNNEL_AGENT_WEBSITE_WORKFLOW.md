B"H
Boruch Hashem
Blessed is He

# Tunnel Agent Website Workflow

The Awtsmoos renews creator, machine, source, and public request at every instant; Awtsmoos.com lets a trusted agent carry one owned folder through creation and publication while each success claim stays attached to the evidence that can actually support it.

## The shortest safe flow

1. Inspect the requested project folder before writing.
2. Create or rewrite ordinary `index.html`, CSS, JavaScript, Markdown, images, and public assets.
3. Confirm the intended public root contains `index.html` and relative asset paths resolve inside that root.
4. Call `sitePublishFolder` with owned `path`, DNS-safe `siteId`, and `mode=direct|snapshot`.
5. Use the returned `publication.canonicalUrl`; never derive a website URL from an OS or Drive path.
6. Inspect `sourceAvailable` and `entryReady`.
7. Inspect `canonicalVerifiedLive`. If delivery is uncertain or source changes later, call `sitePublicationStatus`.
8. Open the canonical URL and verify expected HTTP, page content, assets, and relevant browser runtime behavior before reporting completion.

## Publication protocol v1

Tunnel Control catalog `3.7.0` exposes a publication protocol without changing historical runtime result objects. Mutation actions advertise `reconcile-before-replay`, `reconcileAction: sitePublicationStatus`, and `idempotency: not-provided`. Status reads advertise `safe-read`.

Use the pure publication evidence interpreter when an agent needs lifecycle meaning from an existing result. A mutation remains `acknowledged`; a status read is `observed`. `verified-live` is returned only when the real publication testimony explicitly carries `canonicalVerifiedLive: true`. `siteUnpublish` can prove server mapping removal as `verified-unmapped`, but that does not claim DNS caches or every external client have converged.

## Direct versus snapshot

Use `direct` when publication should follow the owned hosted folder. Use `snapshot` when publication should point at copied point-in-time source. The modes have different source lifecycles and should never be treated as aliases.

## Build from nothing

If the owner provides only an idea, create a small ordinary source tree first. Keep it editable, prove the entry file, then publish the folder. Drive Website Maker offers blank, landing, portfolio, and docs starters using the same source model.

## If automation is already inside Drive

Use `window.GeelooySiteBuilder` instead of routing an in-page agent back through Tunnel or scraping DOM controls. Its v1.2 envelope separates client correlation, action contract, server facts, external verification, and transport lifecycle. See `WEBSITE_MAKER_AGENT_API.md`.

## Dynamic Node on the owner's machine

Static publication and connected Node runtime are distinct powers. Save a `native-compute` recipe containing only `cwd`, a project-relative `entry`, `port`, and public scalar arguments. In Geelooy OS choose a live owned Tunnel machine, start the process, inspect logs, and prove the listening service before exposing it. A saved recipe is not a running process.

## Custom domains

First prove the canonical Awtsmoos URL. Then claim the hostname, publish the ownership TXT record at the current DNS provider, verify ownership, and apply only server-attested routing records. Preserve MX, SPF, DKIM, DMARC, CAA, SRV, NS, vendor verification, and unrelated subdomains.

DNS verification, route activation, TLS issuance, and browser health are separate witnesses. An API response can carry real resolver evidence for ownership without proving every other DNS or TLS gate.

## When a mutation result is uncertain

Do not replay blindly. Reconcile first. A mutation receipt proves the mutation path completed; it is not a durable idempotency guarantee and does not automatically prove the public browser received the intended page.

## Completion testimony

A Tunnel-created website is complete only when source exists, canonical mapping exists, entry readiness is proven, the authoritative URL is known, and live HTTP/browser evidence matches the intended website.
