# B"H

Boruch Hashem

Blessed is He

## Cache Retirement Repair

The Awtsmoos renews the page without forcing yesterday's shell to govern today's vessel. The live repository has already retired offline caching, but its cleanup script repeats origin-wide registration, cache, and IndexedDB scans on every page load.

## Approved rewrites

### `geelooy/service-worker.js`

- Preserve the no-fetch, no-cache contract.
- Activate immediately.
- Unregister itself without forcibly navigating every open client.
- Notify clients that the legacy worker retired.
- Use tabs and focused documentation.

### `geelooy/register.js`

- Replace the repeated kill switch with a versioned one-time retirement.
- Unregister same-origin workers.
- Clear legacy Cache Storage once for the declared retirement version.
- Remove only the historical `awtsmoos-metadata-` IndexedDB family.
- Avoid routine console noise.
- Reload at most once when a controller must be released.
- Tolerate blocked storage and partial browser support.

## Verification

1. Run JavaScript syntax checks.
2. Load Home with service-worker bypass disabled.
3. Record registration and cache counts before and after.
4. Reload and prove the cleanup does not repeat.
5. Confirm no page shell is served by a stale worker.
