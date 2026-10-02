B"H
Boruch Hashem
Blessed is He

# Website Maker Tutorial Index

The Awtsmoos renews every question while Awtsmoos.com should let the owner begin from the thing they want to do, not from an internal subsystem name.

## I want to make a website from nothing

Start in **Drive → Website Maker → Build**. Choose a starter or blank source, edit ordinary HTML/CSS/JS in **Code**, inspect saved source in **Preview**, then use **Publish**. Open only the canonical URL returned by the publisher.

Read: `README.md` and `TROUBLESHOOTING.md`.

## I want a Tunnel agent to make and publish it

Let the agent create or inspect the owned source folder, call `publishWebsite`, require live canonical verification, then open the returned `publication.canonicalUrl` in a real browser. Never derive a website URL from a Virtual OS path or file-write navigation candidate.

Read: `TUNNEL_AGENT_WEBSITE_WORKFLOW.md` and `PUBLISH_FROM_TUNNEL.md`.

## I need advanced direct/snapshot site mapping

Use `sitePublishFolder` only when you intentionally need the Drive/Sites mapping plane with a named `siteId` and direct-versus-snapshot lifecycle semantics. For an ordinary static owned folder, prefer `publishWebsite`.

## I want software inside Drive to control Website Maker

Use the frozen `window.GeelooySiteBuilder` API instead of scraping DOM buttons. Source, preview, publication, and domain actions return serializable result envelopes.

Read: `WEBSITE_MAKER_AGENT_API.md`.

## I want to connect my own domain

First prove the canonical Awtsmoos URL. Then claim the hostname, publish the ownership TXT record at the existing DNS provider, verify ownership, apply the server-attested web route, and verify TLS/browser health.

Read: `CUSTOM_DOMAINS.md`.

## I want to move only the website and keep email

Keep current authoritative nameservers. Change only server-attested website A/AAAA/CNAME records. Preserve MX, SPF, DKIM, DMARC, SRV, vendor-verification records, and unrelated subdomains.

Read: `EMAIL_DNS.md`, `DNS_MIGRATION.md`, and `DNS_CUTOVER_CHECKLIST.md`.

## I want provider-specific DNS instructions

Read `DNS_PROVIDER_PLAYBOOKS.md` and `DNS_PROVIDER_REFERENCES.md` for Cloudflare, GoDaddy, Namecheap, Squarespace Domains, and Route 53 guidance.

## I want to move the whole DNS provider

Inventory and rebuild the complete zone first. Treat nameserver delegation separately from record editing, preserve rollback capability, and check DNSSEC before retiring the old provider.

Read: `DNS_MIGRATION.md`, `DNS_CUTOVER_CHECKLIST.md`, and `DNSSEC_MIGRATION.md`.

## I want a Node website on my connected machine

Use a `native-compute` recipe with `cwd`, project-relative `entry`, `port`, and public arguments. Choose a currently live owned Tunnel device at launch time and prove the listening service.

## Something does not load

Debug in order: source → publication receipt → returned canonical URL → assets → browser console/network → optional domain ownership → DNS → TLS → connected runtime. A 404 on `/geelooy/os/...`, `/apps/...`, or `/u/...` may simply mean a source-navigation candidate was mistaken for a published website.

Read: `TROUBLESHOOTING.md`.
