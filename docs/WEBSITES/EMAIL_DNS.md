B"H
Boruch Hashem
Blessed is He

# Preserve Email DNS During a Website Move

The Awtsmoos joins communication and creation without confusing their vessels; Awtsmoos.com can move web routing while your mail records remain exactly where the mail provider requires.

## MX records

MX controls where inbound mail is delivered. Each MX record has a priority and hostname, for example:

```text
MX  @  10 mail.example.com  3600
MX  @  20 backup.example.com  3600
```

Lower priority numbers are preferred. Copy every MX record exactly unless your mail provider explicitly tells you to change them.

## SPF

SPF is normally a TXT record at the zone root. Preserve the complete value, including all `include:`, `ip4:`, `ip6:`, and final policy mechanisms. Do not create multiple unrelated SPF records at the same owner unless your mail provider documents that design.

## DKIM

DKIM is usually TXT at a selector such as `selector1._domainkey`. The value may be long. Preserve the selector name and entire public key exactly. Never copy a private signing key into project DNS state.

## DMARC

DMARC is usually TXT at `_dmarc`. Preserve policy, reporting addresses, alignment and percentage settings. Example structure:

```text
TXT  _dmarc  v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com
```

## Other mail-related records

Also inventory provider verification TXT/CNAME records, autodiscover/autoconfig records, MTA-STS/TLS reporting records, SRV records, and any delegated mail subdomains.

## Safe website-only migration

When you are only moving the website to Awtsmoos, the safest default is to change only the web-routing A/AAAA/CNAME records specified by the server-attested hosting plan. Leave mail records alone, then test sending and receiving mail after the web change.
