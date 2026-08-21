B"H
Boruch Hashem
Blessed is He

# DNS Provider Playbooks for Awtsmoos Websites

The Awtsmoos renews every domain and every answer while Awtsmoos.com asks the finite DNS provider to carry only the records it actually owns; a safe migration preserves mail and service records before web routing is changed, and changes nameservers only when a complete replacement authoritative zone is truly ready.

These playbooks describe current provider concepts verified against official provider documentation in August 2026. Provider dashboards may rename buttons later, so trust the record fields and the provider's current official help if labels move.

## Universal rule before touching anything

1. Export, screenshot, or copy the complete existing zone.
2. Put A, AAAA, CNAME, TXT, MX, CAA, SRV, NS and important subdomains into the Awtsmoos Project Settings DNS migration worksheet.
3. Identify mail records: MX, SPF TXT, DKIM TXT/CNAME selectors, DMARC TXT, autodiscover/autoconfig, MTA-STS/TLS reporting and vendor-verification records.
4. Publish the website canonically on Awtsmoos before changing custom-domain DNS.
5. Claim and verify the custom domain.
6. Apply only the server-attested web-routing record when keeping the existing DNS provider.
7. Do not change registrar nameservers unless a complete destination authoritative zone already exists and is answering correctly.

## Cloudflare

Cloudflare's current dashboard uses **DNS → Records** with **Add record** and per-record **Edit** controls. A/AAAA/CNAME records also have Cloudflare-specific proxy status. Cloudflare supports zone-file import/export.

### Website-only move to Awtsmoos

- Keep the Cloudflare nameservers in place.
- Add the Awtsmoos ownership TXT record.
- Verify the hostname in Drive.
- Change only the A/AAAA/CNAME web-routing records attested by the Awtsmoos hosting plan.
- Leave MX and mail-related TXT/CNAME records intact.
- Decide Cloudflare proxy status deliberately for web-routing records; do not copy a proxy setting onto mail records.

### Full authoritative migration away from Cloudflare

Export/review the full zone first. Build and verify the replacement zone before updating registrar nameservers. Do not cancel or remove the old authoritative service until web, email and other critical services resolve correctly through the new nameservers.

## GoDaddy

GoDaddy separates editing records from changing domain nameservers. When a domain uses GoDaddy nameservers, DNS records are managed there; when nameservers point elsewhere, the zone is managed at that other provider.

### Website-only move to Awtsmoos

- Open the domain's DNS records.
- Preserve every non-web record.
- Add the Awtsmoos ownership TXT record.
- Replace only the attested web-routing record after ownership verification.
- Do not use the **Nameservers** control for an ordinary website-only move.

### Full DNS-provider move

Copy the complete zone to the destination first. Only then use the registrar nameserver control. Verify website and email through the new authoritative service before removing the old zone.

## Namecheap

Namecheap exposes nameserver selection under the domain's management page. Host-record editing is available when the domain uses Namecheap BasicDNS, FreeDNS or PremiumDNS; domains on third-party or hosting nameservers must be edited at the provider actually serving the zone.

### Website-only move to Awtsmoos

- First identify which nameservers are authoritative.
- Edit the records at that DNS host, not necessarily at the registrar.
- Preserve MX/SPF/DKIM/DMARC and other service records.
- Add the Awtsmoos ownership TXT record and then the attested web route.

### Nameserver warning

Switching to a different nameserver service changes where the zone is managed. Rebuild all required records before changing nameservers.

## Squarespace Domains

Squarespace's current domains dashboard exposes DNS record editing through the domain's DNS panel. It distinguishes DNS-record editing from nameserver changes, and notes that custom nameservers move most DNS management to the nameserver provider.

### Website-only move to Awtsmoos

- Keep the current nameservers.
- Use the DNS panel to add ownership TXT and the final web-routing record.
- Preserve email records including MX, DKIM, DMARC, SPF and SRV.
- Reauthenticate if the dashboard requires password or 2FA confirmation for DNS changes.

### Full authoritative move

Only use the Advanced nameserver controls after the replacement zone is complete and verified.

## Amazon Route 53

Route 53 uses a **public hosted zone** containing the domain's records. A public hosted zone has authoritative NS and SOA records; AWS generally recommends leaving those generated records alone.

### Website-only move to Awtsmoos while keeping Route 53

- Keep the hosted zone and its assigned nameservers.
- Add the Awtsmoos ownership TXT record.
- Preserve mail/service records.
- Change only the web route required by the Awtsmoos hosting plan.

### Moving authoritative DNS into Route 53

Create the new public hosted zone, recreate the full set of required records, test the new zone, then update the registrar to the four nameservers assigned to the hosted zone. Keep the old zone available until web, email and other services have been verified through the new authority.

## What Awtsmoos should show beside every provider guide

- Existing provider / authoritative nameservers.
- Records preserved in the project worksheet.
- Ownership TXT record.
- Server-attested web-routing record.
- Mail-preservation warning.
- Nameserver availability testimony.
- Ownership verification state.
- Routing activation state.
- TLS state.
- External live-health state.

The Awtsmoos creates every answer, yet the migration remains truthful only when the old zone and new intention are compared record by record; Awtsmoos.com therefore teaches preservation before delegation, evidence before celebration, and a living website without sacrificing the mail that gives its owner a voice.
