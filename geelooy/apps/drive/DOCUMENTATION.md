B"H
Boruch Hashem
Blessed is He

# Awtsmoos Drive · Website Maker

The Awtsmoos renews every file, route, domain, connected machine, and responsive vessel in each instant; Awtsmoos.com keeps source, preview, publication, DNS, runtime, and browser evidence distinct so the visible workshop never hides what has actually been proven.

## Guided Website Maker

Open `/apps/drive/`, connect an alias, and use the persistent Website Maker studio. The intended journey is:

- **Build** creates or imports ordinary editable source.
- **Preview** renders the saved source locally and must never be confused with public publication.
- **Code** edits real HTML, CSS, JavaScript, Markdown, images, and assets.
- **Publish** performs the normal canonical static-site publication and surfaces the exact server-returned URL.
- **Domain** stays optional until the canonical Awtsmoos site is already healthy.

## Canonical publication

The normal static-site action is `publishWebsite` against the owned source folder. The result's `publication.canonicalUrl` is authoritative. Do not derive a public website URL from a Drive or Virtual OS source path.

Virtual OS write receipts can expose navigation candidates under `/geelooy/os/`, `/apps/`, or `/u/`. They locate files; they are not public website URLs. Static publication normally returns `/web/<alias>/<slug>/`.

Require `publication.canonicalVerifiedLive === true`, complete release dependency closure, and a real-browser verification of that exact canonical URL before showing a green public-ready state.

`sitePublishFolder` remains an advanced Drive/Sites mapping action for intentional `siteId` plus `direct`/`snapshot` lifecycle control. It should not be the primary button for ordinary folder-to-website publishing.

## Large files and batches

Tunnel Control supports resumable GET staging for oversized writes and transactional batches. Multi-megabyte text and binary files should be transferred through the staged transport automatically rather than encoded into one giant request URI.

## Responsive Drive shell

Drive should stay inside the true viewport at mobile widths, keep primary touch targets at least 44px high, avoid horizontal overflow, and preserve one coherent Awtsmoos shell. Desktop may use the two-column workspace and sticky Website Maker navigation without duplicating global headers.

## Browser agent API

`window.GeelooySiteBuilder` exposes source, preview, publication, domain, and nameserver actions without DOM scraping. Mutation request IDs are correlation identifiers, not automatic server idempotency promises; reconcile uncertain mutations before replay.

## DNS and connected runtime

Custom-domain ownership, DNS routing, TLS, and external browser health are later independent gates. Preserve MX, SPF, DKIM, DMARC, CAA, SRV, delegated NS, verification records, and unrelated subdomains during DNS work.

A `native-compute` project stores a portable recipe only. The actual owned Tunnel machine is selected live at launch time and a saved recipe is not a running process.

## Verification covenant

Drive is only one surface. Trace real behavior through `geelooy/api/social/helper/drive/`, `geelooy/shared/workspace/`, `geelooy/sites/`, the Tunnel publication contracts, and live browser/network evidence. Generated docs are locators; source, tests, publication receipts, and rendered pages remain authoritative.

Read `docs/WEBSITES/README.md`, `PUBLISH_FROM_TUNNEL.md`, `TUTORIAL_INDEX.md`, and `TROUBLESHOOTING.md`.
