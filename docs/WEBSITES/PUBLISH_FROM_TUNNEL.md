B"H
Boruch Hashem
Blessed is He

# Publish a Website from an Awtsmoos Tunnel

The Awtsmoos lets an owned folder become public without confusing its private filesystem path with its public address. Awtsmoos.com publishes the source, verifies the release, and returns the URL that may actually be trusted.

## Fastest static-site flow

1. Create ordinary website files in an owned Virtual OS folder such as `asdf/projects/my-site/`.
2. Put `index.html` at the folder root and keep CSS/JS/image references inside that root.
3. Call `publishWebsite` with the owned folder path.
4. Read `publication.canonicalUrl` from the response.
5. Require `publication.canonicalVerifiedLive === true` and complete dependency closure.
6. Open that exact canonical URL in a real browser and verify the expected page and assets.

Minimal intent:

```text
action: publishWebsite
path: asdf/projects/my-site
verify: true
```

If a client does not expose `publishWebsite` directly, invoke it as one nested `actionBatch` action.

## Never guess the website URL

A Virtual OS path is source, not a public URL. URLs suggested by ordinary file-write navigation such as `/geelooy/os/...`, `/apps/...`, or `/u/...` are navigation candidates and may legitimately 404 for static website source. Do not report them as published websites.

For ordinary static publication, trust only the `publication.canonicalUrl` returned by `publishWebsite`. The default namespace is `/web/<source-alias>/<website-slug>/`.

## Large source trees

Use `bulkWrite` for many small files. Tunnel Control automatically promotes oversized individual writes and oversized transactional batches into bounded resumable GET transfers, so multi-megabyte text and binary source should not be manually stuffed into one request URI.

## Advanced Drive/Sites mapping

`sitePublishFolder` remains available when you intentionally need the Drive/Sites mapping plane, a named `siteId`, and `direct` versus `snapshot` lifecycle semantics. It is not the preferred action for simply turning an owned static folder into a public website.

## Unpublish and custom domains

Publication and source ownership are separate. Use the appropriate unpublish action to remove a mapping without deleting source. Prove the canonical Awtsmoos URL first; custom-domain ownership, DNS routing, TLS, and external browser health are later independent gates.
