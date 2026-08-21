B"H
Boruch Hashem
Blessed is He

# Websites on Awtsmoos

The Awtsmoos renews every file and every request; Awtsmoos.com lets an ordinary folder become a public world while keeping source, publication, runtime, DNS, provider authority, DNSSEC trust, and browser evidence as separate truthful vessels.

## The shortest human path

1. Open `/apps/drive/` and connect an alias.
2. Use **Website Maker → Build** to create ordinary editable source, or upload an existing folder.
3. Use **Preview** to inspect saved source.
4. Use **Publish** to map the current folder to a named site.
5. Open the exact canonical URL returned by publication.
6. Add a custom domain only after the canonical site itself is proven healthy.

## The shortest Tunnel path

1. Create or inspect the owned source folder.
2. Call `sitePublishFolder(path, siteId, mode)` using `direct` or `snapshot`.
3. Inspect `publication.canonicalUrl`, `sourceAvailable`, `entryReady`, and `canonicalVerifiedLive`.
4. Reconcile with `sitePublicationStatus` after uncertain delivery or source changes.
5. Open the canonical URL and inspect HTTP, expected assets, and relevant browser failures before reporting success.

## Choose your tutorial

- [Publish from an Awtsmoos Tunnel](./PUBLISH_FROM_TUNNEL.md)
- [Tunnel agent: create, publish, reconcile, verify](./TUNNEL_AGENT_WEBSITE_WORKFLOW.md)
- [Website Maker in-page Agent API](./WEBSITE_MAKER_AGENT_API.md)
- [Connect a custom domain](./CUSTOM_DOMAINS.md)
- [Move DNS safely](./DNS_MIGRATION.md)
- [DNS provider playbooks](./DNS_PROVIDER_PLAYBOOKS.md)
- [Official DNS provider references](./DNS_PROVIDER_REFERENCES.md)
- [DNS cutover checklist](./DNS_CUTOVER_CHECKLIST.md)
- [DNSSEC during a provider migration](./DNSSEC_MIGRATION.md)
- [Preserve email: MX, SPF, DKIM, DMARC](./EMAIL_DNS.md)
- [Troubleshoot a website that does not load](./TROUBLESHOOTING.md)

## DNS migration worksheet

Project Settings preserves a portable worksheet for A, AAAA, CNAME, TXT, MX, CAA, SRV, and NS records. The worksheet is configuration intent, not live DNS. Use it to inventory and carry the whole zone safely; then apply server-attested routing changes at the current provider or through a real attached provider adapter.

The provider playbooks cover Cloudflare, GoDaddy, Namecheap, Squarespace Domains, and Amazon Route 53. The cutover checklist separates a website-only move from a full authoritative nameserver migration. The DNSSEC guide covers the parent-zone trust edge case that can break an otherwise correct nameserver migration.

## Two automation planes

Tunnel Control is for owned-device and Virtual-OS automation. `window.GeelooySiteBuilder` is for software already running inside the Drive Website Maker page. Both converge on guarded Drive/site/domain services, but one does not impersonate the other.

## Static versus connected Node

Static publication serves ordinary owned files through the Sites gateway. For a Node project on an owned connected machine, choose `native-compute`, save the portable recipe, then use **Open on connected machine** inside Geelooy OS. The live Tunnel device is chosen at launch time and is not stored in portable project state.

## Current DNS boundary

Awtsmoos custom-domain hosting supports external DNS instructions and server-attested ownership/routing plans. Awtsmoos authoritative nameservers are not advertised as deployed unless the live hosting plan explicitly says otherwise. Keep DNS at the current provider by default, preserve mail/service records, and treat DNSSEC as a separate trust migration before any provider or registrar change.
