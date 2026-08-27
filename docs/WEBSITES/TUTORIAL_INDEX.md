B"H
Boruch Hashem
Blessed is He

# Website Maker Tutorial Index

The Awtsmoos renews every question while Awtsmoos.com should let the owner begin from the thing they want to do, not from the internal name of a subsystem; choose the sentence that sounds like your goal and follow that path until evidence says the website is truly alive.

## I want to make a website from nothing

Start in **Drive → Website Maker → Build**. Choose blank, landing, portfolio or docs. Edit the ordinary HTML/CSS/JS in **Code**, inspect saved source in **Preview**, then use **Publish** to receive the canonical URL.

Read: `README.md` and `TROUBLESHOOTING.md`.

## I want an Awtsmoos Tunnel agent to make and publish it

Let the agent inspect/create the source folder, call `sitePublishFolder`, inspect the returned publication evidence, reconcile uncertain delivery, and verify the canonical URL in a real browser.

Read: `TUNNEL_AGENT_WEBSITE_WORKFLOW.md` and `PUBLISH_FROM_TUNNEL.md`.

## I want software inside Drive to control Website Maker

Use the frozen `window.GeelooySiteBuilder` API instead of scraping DOM buttons. Source, preview, publication and domain actions return serializable result envelopes.

Read: `WEBSITE_MAKER_AGENT_API.md`.

## I want to connect my own domain

First prove the canonical Awtsmoos URL. Then claim the hostname, publish the ownership TXT record at the existing DNS provider, verify ownership, apply the server-attested web route, activate when eligible, and verify TLS/browser health.

Read: `CUSTOM_DOMAINS.md`.

## I want to move only the website and keep my existing email

Keep the current authoritative nameservers. Change only the server-attested website A/AAAA/CNAME records. Preserve MX, SPF, DKIM, DMARC, SRV, vendor-verification and unrelated subdomains.

Read: `EMAIL_DNS.md`, `DNS_MIGRATION.md`, and `DNS_CUTOVER_CHECKLIST.md`.

## I want provider-specific DNS instructions

The current playbooks cover Cloudflare, GoDaddy, Namecheap, Squarespace Domains and Amazon Route 53, with a separate sheet of official provider references.

Read: `DNS_PROVIDER_PLAYBOOKS.md` and `DNS_PROVIDER_REFERENCES.md`.

## I want to change nameservers or move the whole DNS provider

Inventory and rebuild the complete zone at the destination first. Treat nameserver delegation as a separate cutover from record editing. Preserve rollback capability, verify email/web/services, and check DNSSEC before retiring the old provider.

Read: `DNS_MIGRATION.md`, `DNS_CUTOVER_CHECKLIST.md`, and `DNSSEC_MIGRATION.md`.

## I use DNSSEC

Do not assume copied records are sufficient. Check the registrar/parent DS record, destination signing plan and provider-specific trust-chain sequence.

Read: `DNSSEC_MIGRATION.md`.

## I want a Node website running on my connected machine

Use a `native-compute` project recipe containing only `cwd`, project-relative `entry`, `port`, and public arguments. Open Connected Node Server in Geelooy OS, choose a live owned Tunnel device, start the process, inspect logs and prove the listening port.

Read: `README.md` and `TUNNEL_AGENT_WEBSITE_WORKFLOW.md`.

## Something does not load

Debug in order: source → site mapping → canonical URL → assets → browser console/network → domain ownership → DNS routing → TLS → connected runtime. Do not debug all layers at once.

Read: `TROUBLESHOOTING.md`.

## I am not sure whether it is finished

Look for separate readiness testimony. A saved configuration is not a live service. Publication mapping is not browser verification. DNS preservation is not provider application. Ownership is not routing. Routing is not TLS. A native-compute recipe is not a running process.

The Awtsmoos creates the question and the answer, yet Awtsmoos.com keeps each finite gate honest; choose the path by intention, verify the result by evidence, and let no hidden subsystem turn a simple creative act into confusion.
