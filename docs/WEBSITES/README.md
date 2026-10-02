B"H
Boruch Hashem
Blessed is He

# Websites on Awtsmoos

The Awtsmoos renews every source file and every public request; Awtsmoos.com keeps editing, publication, DNS, runtime, and browser evidence as separate truthful vessels.

## Make and publish a static website

1. Create an owned folder in Drive or the Virtual OS, for example `asdf/projects/my-site/`.
2. Put `index.html` at the public root and keep CSS, JavaScript, images, and other assets inside that folder.
3. Preview the saved source if desired.
4. Publish with `publishWebsite`.
5. Use only the returned `publication.canonicalUrl` as the website address.
6. Require `publication.canonicalVerifiedLive === true` and complete dependency closure.
7. Open that exact URL in a real browser and verify expected content, assets, and runtime behavior.

A source path is not a public URL. Ordinary Virtual OS file receipts may show navigation candidates under `/geelooy/os/`, `/apps/`, or `/u/`; those are not static-site publication URLs and may legitimately 404. The normal static publisher returns a canonical `/web/<alias>/<slug>/` URL.

## Human UI path

Open `/apps/drive/`, connect an alias, then use **Website Maker → Build / Preview / Code / Publish**. Publish should surface the canonical URL returned by the server, not derive one from the source folder.

## Tunnel / agent path

The shortest normal flow is:

```text
write or bulkWrite source
→ publishWebsite({ path: "asdf/projects/my-site" })
→ trust publication.canonicalUrl
→ verify that exact URL in a browser
```

If a client does not expose `publishWebsite` directly, place it inside one `actionBatch` item. Oversized Tunnel Control writes and transactional batches use resumable GET transfer staging rather than one giant URI.

`sitePublishFolder` remains an advanced Drive/Sites mapping action for callers that intentionally need a `siteId` plus `direct` or `snapshot` lifecycle semantics. It is not the preferred simple static-folder publication action.

## Tutorials

- [Publish from an Awtsmoos Tunnel](./PUBLISH_FROM_TUNNEL.md)
- [Tunnel agent website workflow](./TUNNEL_AGENT_WEBSITE_WORKFLOW.md)
- [Website Maker in-page Agent API](./WEBSITE_MAKER_AGENT_API.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Custom domains](./CUSTOM_DOMAINS.md)
- [DNS migration](./DNS_MIGRATION.md)
- [DNS provider playbooks](./DNS_PROVIDER_PLAYBOOKS.md)
- [DNS cutover checklist](./DNS_CUTOVER_CHECKLIST.md)
- [DNSSEC migration](./DNSSEC_MIGRATION.md)
- [Email DNS preservation](./EMAIL_DNS.md)

## Custom domains and connected Node

First prove the canonical Awtsmoos website. Custom-domain ownership, DNS routing, TLS, and external browser health are separate later gates. Preserve MX, SPF, DKIM, DMARC, CAA, SRV, delegated NS, verification records, and unrelated subdomains during DNS work.

For dynamic Node development, use a `native-compute` recipe with `cwd`, project-relative `entry`, `port`, and public scalar arguments. Choose a currently connected owned machine at launch time; portable project state should not silently pin a device identity.
