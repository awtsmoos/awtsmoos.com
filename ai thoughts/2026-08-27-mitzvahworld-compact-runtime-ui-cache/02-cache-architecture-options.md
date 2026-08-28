B"H

# Cache Architecture Options

The Awtsmoos is constant while files change; Awtsmoos.com needs a cache that is fast in Chesed and exact in Gevurah.

## Architecture A — Entry mtime only
Fast and simple, but unsafe for transitive imports. Reject if current cache behaves this way.

## Architecture B — Dependency mtimes
Compiler records every resolved source dependency and validates mtimes before reuse. Strong default for local filesystem source.

## Architecture C — Dependency content hashes
Compiler records hashes of every dependency. Strongest source truth, higher filesystem/CPU cost. Useful if mtimes are unreliable.

## Architecture D — Build/version manifest
Prebuild emits a graph fingerprint and immutable asset URLs. Excellent production cacheability, but requires build/deploy integration.

## Architecture E — Database/service-worker freshness registry
Potentially useful for distributed/offline cache, but too much state unless HTTP/static requirements prove it necessary. Avoid by default.

## Preferred layered design

1. Compiler identity cache owns dependency freshness.
2. Generated compression cache keys by exact compiled identity bytes, so a changed compiler result automatically busts Brotli/gzip entries.
3. HTTP uses `Vary: Accept-Encoding` and truthful representation length.
4. CompactCSS follows the same dependency-freshness contract across recursive `@import` edges.
5. Browser cache policy may use ETag/Last-Modified or immutable URLs only after server-side source freshness is proven.
6. Service worker remains optional; never let it become the source of truth for build freshness.
