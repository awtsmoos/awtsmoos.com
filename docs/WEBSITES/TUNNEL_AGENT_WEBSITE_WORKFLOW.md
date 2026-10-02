B"H
Boruch Hashem
Blessed is He

# Tunnel Agent Website Workflow

The Awtsmoos renews creator, source, publisher, and browser at every instant; Awtsmoos.com keeps each gate explicit so an agent never mistakes a filesystem path, mutation receipt, or guessed URL for a live website.

## Shortest safe flow

1. Inspect the owned project folder before writing.
2. Create or rewrite ordinary `index.html`, CSS, JavaScript, Markdown, images, and public assets.
3. Confirm `index.html` is at the intended public root and relative dependencies stay inside that root.
4. Call `publishWebsite` with the owned folder path and verification enabled.
5. Read `publication.canonicalUrl`; never derive a public website address from the Virtual OS path.
6. Require `publication.canonicalVerifiedLive === true`, `verification.entryStatus === 200`, and complete dependency closure.
7. Open that exact canonical URL in a real browser and inspect expected DOM/assets plus relevant console/network failures.
8. Only then report the website as working.

Example:

```text
action: publishWebsite
path: asdf/projects/my-site
verify: true
```

If the caller's static enum does not expose `publishWebsite`, invoke it as one nested `actionBatch` item.

## Source paths are not website URLs

Virtual OS write receipts may include navigation candidates such as `/geelooy/os/...`, `/apps/...`, or `/u/...`. They help locate files but are not publication testimony. A normal static website published from `asdf/projects/my-site` receives a server-returned canonical address under `/web/asdf/<slug>/`.

A 404 on a guessed VOS navigation path does not prove publication failed. Conversely, a successful mutation does not prove the canonical website renders. Trust the publisher receipt, then browser-test its exact URL.

## Large websites and batches

Use `bulkWrite` for batches. Oversized Tunnel Control writes and oversized transactional batches are promoted into resumable GET transfer staging, then committed atomically. Agents should not manually force multi-megabyte text or binary source into one query URI.

## Advanced Drive/Sites mapping

Use `sitePublishFolder` only when the project intentionally needs the Drive/Sites mapping plane with explicit `siteId` and `direct` versus `snapshot` lifecycle semantics. Reconcile uncertain mapping mutations with `sitePublicationStatus` before replaying them.

## In-page Drive automation

Software already running inside Website Maker should use `window.GeelooySiteBuilder` rather than scraping buttons. The in-page API and Tunnel publication are separate automation surfaces that converge on guarded hosting services.

## Dynamic Node and custom domains

Static publication is not a running native process. For connected Node development, save a `native-compute` recipe and choose a currently connected owned Tunnel device at launch time.

First prove the canonical Awtsmoos static URL. Custom-domain ownership, DNS routing, TLS issuance, and external browser health are separate later witnesses. Preserve mail and unrelated service records during DNS work.

## Completion testimony

A Tunnel-created static website is complete when owned source exists, publication returned a canonical URL, canonical verification is live, dependency closure is complete, and a real browser loaded the intended page and assets without a relevant runtime failure.
