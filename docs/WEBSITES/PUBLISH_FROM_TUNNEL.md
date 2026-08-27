B"H
Boruch Hashem
Blessed is He

# Publish a Website from an Awtsmoos Tunnel

The Awtsmoos lets your own machine remain the workshop while Awtsmoos.com provides a guarded publication doorway; the Tunnel carries explicit source intention without turning your whole device into public storage.

## Fastest folder publication

Use the Tunnel action `sitePublishFolder`. Supply:

- `path`: folder on the owned device or Virtual OS;
- `siteId`: DNS-safe public site identity;
- `mode`: `direct` or `snapshot`.

Choose `direct` when the published site should follow the hosted folder. Choose `snapshot` when you want the publication to preserve a copied point-in-time source.

Example intent:

```text
path: projects/friend-site
siteId: friend-site
mode: direct
```

After publication, read `publication.canonicalUrl` from the result and open that exact URL. Also inspect `sourceAvailable`, `entryReady`, and `canonicalVerifiedLive` rather than treating a successful mutation alone as proof that the website renders.

## Publishing generated source

Agents may use `sitePublishBootstrap` when they already have an explicit bounded file manifest. This is useful when an agent creates HTML/CSS/JS/Markdown source and wants publication to be one guarded operation.

## Unpublish without deleting source

`siteUnpublish` removes the canonical mapping while leaving the source bytes alone. This separation is intentional: publication is reversible and source ownership remains independent.

## Node on the connected device

For dynamic Node development, save a `native-compute` project recipe with `cwd`, relative `entry`, `port`, and public arguments. In Geelooy OS, open Connected Node Server from the saved project. Choose a currently connected owned machine there; no Tunnel machine identity belongs in the portable project file.
