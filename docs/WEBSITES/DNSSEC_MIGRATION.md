B"H
Boruch Hashem
Blessed is He

# DNSSEC During a DNS Provider Migration

The Awtsmoos renews every answer and every chain of trust while Awtsmoos.com refuses to let a secure domain become unreachable because a registrar still trusts a key that the new authoritative provider no longer holds. DNSSEC is not an ordinary A, MX or TXT record migration; it joins the parent zone to the child zone through delegation-signing testimony and therefore needs its own cutover plan.

## Why DNSSEC can break an otherwise correct migration

When DNSSEC is enabled, the registrar or parent zone may publish a DS record that says which key should authenticate the child zone. If you move authoritative nameservers to a provider using different signing keys while the old DS record remains, validating resolvers can reject the new DNS answers. To the owner, this can look like a complete outage even though the A, MX, TXT and other records were copied correctly.

## Website-only move while keeping the current DNS provider

Usually do **not** change DNSSEC. If nameservers and authoritative DNS remain where they are and you are only changing the website's A/AAAA/CNAME route, preserve the existing DNSSEC configuration. The web-host move and the DNSSEC trust chain are separate concerns.

## Full nameserver/provider migration

Before changing nameservers:

1. Determine whether DNSSEC is currently enabled at the registrar/parent.
2. Record the current DS information and the current DNS provider's signing state.
3. Read the destination provider's DNSSEC migration procedure.
4. Reproduce and verify all ordinary DNS records in the destination zone.
5. Follow the provider-specific sequence for removing, replacing or re-establishing DS trust.
6. Do not improvise DS values from DNSKEY output unless the provider's documented procedure requires it.
7. Verify signed DNS responses through the new authority before considering the migration complete.

## Route 53 pattern

AWS's current migration documentation treats DNSSEC as an explicit migration stage. For a domain in use, AWS documents removing the parent DS record when required before switching authoritative nameservers, then re-enabling signing and re-establishing the chain of trust after the migration. Follow the current AWS procedure for the specific zone rather than copying DS values from an old hosted zone.

## Squarespace Domains pattern

Squarespace Domains currently enables DNSSEC automatically for supported Squarespace-managed domains. A move to custom nameservers or another authoritative provider therefore requires checking how that provider and the registrar manage the DNSSEC chain rather than assuming nameserver replacement alone is enough.

## Awtsmoos Website Maker rule

The future DNS migration cockpit should display DNSSEC as its own readiness gate whenever a full authoritative migration is requested:

- Current DNSSEC state known.
- Parent DS state known.
- Destination signing plan known.
- Provider-specific cutover instructions acknowledged.
- New authoritative DNS validated.
- New chain of trust validated when DNSSEC is re-enabled.

The Awtsmoos is beyond every key and signature while finite DNS security depends on an exact chain; Awtsmoos.com therefore treats DNSSEC not as a decorative checkbox but as a separate trust migration whose evidence must remain plain.
