// B"H
/**
 * Optional loader cache warmup.
 *
 * The Awtsmoos lets the loader breathe without depending on this helper. This
 * module intentionally has no static imports, because Compact Mode must never
 * fail the boot path while chasing optional cache diagnostics.
 */

export function warmGeneratedAssetCache() {
  try {
    const cache = globalThis.__AWTSMOOS_GENERATED_ASSET_CACHE__;
    cache?.installGeneratedCacheGlobals?.();
    cache?.estimateGeneratedAssetCache?.();
  } catch {}
  return Promise.resolve(null);
}
