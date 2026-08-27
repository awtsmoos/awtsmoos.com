B"H
Boruch Hashem
Blessed is He

# DNS Cutover Checklist

The Awtsmoos renews the domain every instant, while a registrar and DNS provider expose only finite records and caches; Awtsmoos.com makes the cutover reversible by refusing to destroy old testimony before the new authoritative answer is proven.

## Before changing web records

- [ ] Canonical Awtsmoos website URL loads correctly.
- [ ] `index.html` and required assets are ready.
- [ ] Existing DNS zone is exported, copied or screenshotted.
- [ ] A, AAAA, CNAME, TXT, MX, CAA, SRV, NS and important subdomains are inventoried.
- [ ] MX priorities and hosts are preserved.
- [ ] SPF TXT is preserved completely.
- [ ] Every DKIM selector and public key is preserved.
- [ ] DMARC policy/reporting addresses are preserved.
- [ ] Vendor verification and email-autoconfiguration records are preserved.
- [ ] Custom-domain claim points at the intended Awtsmoos site.
- [ ] Ownership TXT record is published.
- [ ] Ownership verification is successful.

## Website-only cutover at the existing DNS provider

- [ ] Do **not** change registrar nameservers.
- [ ] Copy the server-attested Awtsmoos A/AAAA/CNAME target exactly.
- [ ] Change only the intended website hostname records.
- [ ] Leave MX and unrelated TXT/CNAME/SRV/NS records unchanged.
- [ ] Confirm public DNS returns the new web route.
- [ ] Activate the Awtsmoos route only when eligible.
- [ ] Confirm HTTPS/TLS state.
- [ ] Open the custom domain from a real browser.
- [ ] Confirm expected page and assets.
- [ ] Send and receive a real email through the existing mail service.

## Full authoritative nameserver cutover

- [ ] Destination authoritative DNS service actually exists.
- [ ] Destination zone contains every required old-zone record.
- [ ] Destination zone answers correctly before registrar change.
- [ ] New authoritative nameservers are copied exactly.
- [ ] Registrar nameservers are changed only after the zone is complete.
- [ ] Old DNS service remains active during propagation and verification.
- [ ] Website resolves through new nameservers.
- [ ] Email send/receive is verified.
- [ ] Critical subdomains and services are verified.
- [ ] TLS/CAA behavior is verified.
- [ ] Only after all checks pass may the previous zone be retired.

## Rollback triggers

Rollback or restore records when any of these occur:

- Website becomes unreachable through the intended hostname.
- MX resolution differs unexpectedly.
- Mail delivery fails after the cutover.
- Required DKIM/DMARC/SPF records disappear.
- Important subdomains stop resolving.
- The new nameservers are not authoritative or return an incomplete zone.

## Awtsmoos truth rule

A saved DNS worksheet is not live DNS. An ownership claim is not routing. Routing is not TLS. TLS is not browser health. A nameserver plan is not an authoritative nameserver deployment. Each gate must be observed independently before the project can call the custom domain ready.
