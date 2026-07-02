// B"H
/** Cache warmup: asset estimation is parallel evidence, not a reveal trigger. */
import { installGeneratedCacheGlobals, estimateGeneratedAssetCache } from "../../../systems/cache/GeneratedAssetCache.js?v=compact-worker-absolute-core-20260702-bh1";
export function warmGeneratedAssetCache() {
  installGeneratedCacheGlobals();
  return estimateGeneratedAssetCache().catch(() => null);
}
