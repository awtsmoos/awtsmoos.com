B"H
Boruch Hashem
Blessed is He

# Connect a Custom Domain to an Awtsmoos Website

The Awtsmoos gives each public name a meaning while Awtsmoos.com refuses to collapse ownership, DNS, routing, and TLS into one misleading green switch.

## Before the domain

Publish the folder first and open its canonical Awtsmoos URL. A custom domain should never be used to debug a site that has not yet proven it can render canonically.

## Claim and verify

1. Open Drive → your project → Custom domains.
2. Select the real published site mapping.
3. Enter the hostname you own.
4. Choose **Keep DNS at current provider** unless you operate another nameserver service.
5. Save the claim.
6. Copy the ownership TXT name and value shown by Drive into your DNS provider.
7. Run **Verify** after the record is publicly resolvable.

## Route the website

After ownership is verified, read the hosting plan. It may present direct A/AAAA targets or a CNAME option depending on deployed ingress. Add the record exactly as attested. Do not guess IP addresses from old deployments.

## TLS and activation

Route activation and TLS are separate readiness stages. Only call the custom domain live after routing is active, HTTPS succeeds, and the returned site is the expected publication.

## Nameservers

The current native plan reports Awtsmoos nameserver availability. If it reports unavailable, keep DNS at your current provider. Do not point registrar nameservers at undocumented hosts.

For a full provider migration, read [Move DNS safely](./DNS_MIGRATION.md) and [Preserve email DNS](./EMAIL_DNS.md) before changing anything at the registrar.
