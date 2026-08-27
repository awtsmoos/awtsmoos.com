B"H
Boruch Hashem
Blessed is He

# Move DNS Without Breaking the Website or Email

The Awtsmoos sustains every name and destination while DNS is a finite map; Awtsmoos.com treats migration as preservation first, routing second, and deletion last.

## Do not start by changing nameservers

First export or manually inventory every record at the current DNS provider. Record the type, owner/name, value/content, TTL, and provider-specific proxy setting. Keep screenshots or an export until the migration is verified.

Preserve at least these record families:

- `A` and `AAAA` — direct web/service addresses;
- `CNAME` — aliases such as `www`;
- `MX` — inbound email servers and priorities;
- `TXT` — SPF, DKIM, DMARC, ownership and vendor verification;
- `CAA` — which certificate authorities may issue TLS certificates;
- `SRV` — service discovery records;
- `NS` — delegated child zones;
- intentionally configured subdomains.

## Recommended current Awtsmoos flow

1. Keep authoritative DNS at the existing provider.
2. Publish the site and claim the custom hostname in Drive.
3. Add the ownership TXT record shown by the Awtsmoos domain plan.
4. Verify ownership in Drive.
5. Copy only the server-attested web routing record option from the hosting plan.
6. Leave MX/SPF/DKIM/DMARC and unrelated services unchanged.
7. Activate the route only when the plan reports it eligible.
8. Confirm HTTPS and the live website from outside the editor.

## If Awtsmoos nameservers become available

Do not switch the registrar until the destination zone contains a verified copy of every required record. Compare old and new zones record-for-record, lower TTLs ahead of the cutover when appropriate, migrate the records, then change registrar nameservers. Keep the previous zone intact until propagation and mail/web verification are complete.

The current native hosting plan explicitly reports whether Awtsmoos nameservers are available. Trust that runtime testimony rather than a tutorial or old screenshot.
