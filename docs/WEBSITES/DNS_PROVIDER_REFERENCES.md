B"H
Boruch Hashem
Blessed is He

# Official DNS Provider References

The Awtsmoos renews documentation and dashboards while Awtsmoos.com should never trap an owner inside a stale screenshot; these are official provider references verified during the August 2026 Website Maker pass. Use the Awtsmoos playbooks for the migration strategy and the provider's current page for the exact dashboard control names.

## Cloudflare

- Manage DNS records: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/
- DNS records overview: https://developers.cloudflare.com/dns/manage-dns-records/
- DNS record types: https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/

Cloudflare's current record-management documentation covers Add/Edit/Delete, TTL and A/AAAA/CNAME proxy status.

## GoDaddy

- Manage DNS records: https://www.godaddy.com/en-uk/help/manage-dns-records-680
- Change domain nameservers: https://www.godaddy.com/en-ca/help/change-my-domain-nameservers-664
- Add or edit an A record: https://www.godaddy.com/help/add-or-edit-an-a-record-42546

GoDaddy explicitly separates editing DNS records from changing the domain's nameservers.

## Namecheap

- Set up host records: https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/
- Change DNS / nameservers: https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/

Namecheap's Host Records controls are available only when the relevant Namecheap DNS service is authoritative; otherwise edit records at the actual DNS provider.

## Squarespace Domains

- Edit DNS records: https://support.squarespace.com/hc/en-us/articles/360002101888-Adding-DNS-records-to-your-domain
- Change nameservers: https://support.squarespace.com/hc/en-us/articles/4404183898125-Making-changes-to-nameservers
- DNSSEC: https://support.squarespace.com/hc/en-us/articles/31094668921229-DNSSEC-for-Squarespace-domains

Squarespace distinguishes DNS-record editing from custom nameserver changes and documents mail/security record categories separately.

## Amazon Route 53

- Migrate DNS for a domain in use: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html
- Add/change domain nameservers and glue records: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-name-servers-glue-records.html
- Get hosted-zone nameservers: https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/GetInfoAboutHostedZone.html

AWS recommends reproducing and validating the destination zone before nameserver cutover, monitoring traffic afterward, preserving rollback capability, and handling DNSSEC explicitly when required.

## Awtsmoos rule

Provider documentation tells you **how to operate the provider**. Awtsmoos hosting testimony tells you **which ownership and routing values to apply**. Neither source should impersonate the other.
