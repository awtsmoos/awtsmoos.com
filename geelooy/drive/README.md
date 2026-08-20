<!--B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews idea and source together; Awtsmoos.com keeps every visual act grounded in a real file and every public doorway grounded in authority.
-->

# Geelooy Sites

Geelooy Sites is a mobile-first real-source website builder over Geelooy Drive. Its primary journey is **Build → Preview → Code → Publish → Domain**. Files, Platform, Devices, Access, and Runtime remain available as retractable engineering power.

## Source truth

- HTML, CSS, JavaScript, JSON, Markdown, SVG, and ordinary assets remain the project.
- The builder brief is bounded local state, not an opaque page schema.
- Blank, landing, portfolio, and documentation starters create readable `index.html`, `styles.css`, and `site.js` only when those names are free.
- Preview and Code open the same source document.
- Closing a semantic `<details>` panel does not destroy the editor textarea or preview iframe.

## Human and machine parity

`window.GeelooySiteBuilder` exposes a cataloged machine API. Every action states mutation, capability, scope, availability, description, and affected resource. Source writes, starter creation, and preview publication use the same workspace services as human controls.

Project collection returns bounded metadata, never source bodies, credentials, cookies, SSH material, or DNS secrets. Explicit Code inspection may return only the currently opened document. There is no arbitrary shell API.

## Storage modes

### Standalone Tunnel

- Signed-in sessions discover authorized devices and read files.
- Save/create require a transient scoped key with `tunnel.write`.
- The key remains only in the current transport instance and request header.
- Managed static runtime requires `tunnel.command` and uses dedicated lifecycle actions.

### Embedded Geelooy OS

- Drive uses a same-origin random-channel VFS bridge.
- Only list, read, write, and mkdir cross the confined root.
- No Tunnel key or command authority enters the iframe.
- Tunnel preview publication and runtime remain unavailable.

## Publication stages

1. Source Preview — sandboxed local reflection.
2. Owned Folder Preview — existing Tunnel preview with visibility and TTL.
3. Canonical Awtsmoos Site — existing Drive mapping at `/sites/:aliasId/:siteId/`; builder linking remains gated until an owned mapping endpoint is proven.
4. Custom Domain + HTTPS — requires server claim, DNS verification, Host routing, and TLS orchestration.

## Domains and nameservers

The browser can normalize and plan public hostnames. It can plan either the current DNS provider or custom external nameservers. It cannot generate proof tokens, mutate DNS, activate routing, issue certificates, or claim an Awtsmoos-owned hostname.

Awtsmoos authoritative nameservers are visibly unavailable because production has Nginx, Certbot, and the Node server but no authoritative DNS service/provider. A future server-side `DnsProvider` and domain-claim repository must precede that mode.

## Managed runtime

The purpose-built static lifecycle supports start, rediscovery, logs, public exposure, and stop for the recorded Tunnel route. It is not a dynamic Node hosting shell. Dynamic runtimes, Git, databases, project auth, APIs, forms, and social bindings remain separate capability slices.

## Verification

Run the Drive suite with:

```bash
node --test geelooy/drive/test/*.test.mjs
```

Also run OS Drive/VFS tests, shared Tunnel-client tests, the site-gateway test, syntax checks, the 120-line audit, and the four required browser viewports before release.
