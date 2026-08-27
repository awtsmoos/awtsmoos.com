B"H
Boruch Hashem
Blessed is He

# Website Maker Troubleshooting

The Awtsmoos recreates every request while debugging asks which finite vessel failed; Awtsmoos.com keeps source, mapping, domain, runtime, and browser testimony separate so the broken edge can be found.

## Canonical site does not open

Check in this order:

1. The source folder contains a public `index.html`.
2. The site mapping points at the intended root path.
3. The publication status says the source is available and the entry is ready.
4. Open the exact `canonicalUrl` returned by publication.
5. Inspect HTTP status and browser console/network errors.

## CSS or JavaScript is missing

Use relative asset paths such as `assets/app.js` and `styles/site.css`. Verify files are public and paths match case exactly. Avoid hard-coding a Drive or OS pathname into website source.

## Custom domain fails but canonical URL works

The source publication is probably healthy. Check ownership TXT, routing eligibility, the configured A/AAAA/CNAME record, public DNS resolution, ingress health and TLS separately.

## Email broke after a domain change

Compare MX and TXT records against the pre-migration inventory immediately. Restore missing MX, SPF, DKIM and DMARC records before making additional web-routing changes.

## Connected Node server fails

Confirm a live account-owned Tunnel is connected, the saved `cwd` exists on that machine, `entry` is project-relative, the selected port is free, and the Node process actually listens on that port. Inspect process logs before exposing the preview.

## For agents

Use `sitePublicationStatus` after every publish/reconcile operation. A mutation receipt proves the mutation happened; it does not by itself prove the public page rendered correctly.
