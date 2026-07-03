// B"H
/**
 * @file LivingRegionActors.js
 * @description Default village must be alive: friendly NPCs and animals enter
 * early, but split away from cottages so every spark is inspectable.
 */
import { ensureChossidNpcs } from "../../../npcs/EnsureChossidNpcs.js?v=perf-tight-collision-20260703-bh2";
import { installRegionNpcRuntime } from "../RegionNpcRuntime.js?v=perf-tight-collision-20260703-bh2";
import { buildWildlifeRenderer, installWildlifeTicker } from "../RegionWildlifeRenderer.js?v=perf-tight-collision-20260703-bh3";
import { addLayer, skippedLayer, markLiving } from "./LivingRegionLayers.js?v=perf-tight-collision-20260703-bh2";

export async function addFriendlyNpcs(olam, scene, report) {
  let added = [];
  try { added = await ensureChossidNpcs({ olam, scene }); }
  catch (error) { olam.__livingRegionNpcError = error?.message || String(error); }
  const ticker = installRegionNpcRuntime(olam, report);
  return { added, ticker, count: added.length };
}

export function addWildlifeLayer(root, olam, report) {
  const placeholder = skippedLayer("wildlife");
  placeholder.userData.stats = {
    skipped:true,
    deferred:true,
    reason:"after-first-playable-frame",
    seal:"deferred-wildlife-loading-bh1"
  };
  root.add(placeholder);
  const hydrate = () => {
    const started = performance.now();
    try {
      const wildlife = buildWildlifeRenderer(olam, report);
      wildlife.name = "wildlife_deferred_after_first_playable_frame";
      root.remove(placeholder);
      root.add(wildlife);
      const ticker = installWildlifeTicker(olam, wildlife);
      const count = wildlife.children?.length || 0;
      olam.__livingRegionDeferredWildlife = { ok:true, count, elapsedMs:Math.round(performance.now() - started), at:Date.now(), seal:"deferred-wildlife-loading-bh1" };
      markLiving("wildlife:deferred-done", olam.__livingRegionDeferredWildlife);
      return ticker;
    } catch (error) {
      olam.__livingRegionDeferredWildlife = { ok:false, error:error?.message || String(error), elapsedMs:Math.round(performance.now() - started), at:Date.now(), seal:"deferred-wildlife-loading-bh1" };
      markLiving("wildlife:deferred-error", olam.__livingRegionDeferredWildlife);
      return null;
    }
  };
  setTimeout(() => {
    if (globalThis.requestIdleCallback) requestIdleCallback(hydrate, { timeout:3500 });
    else setTimeout(hydrate, 800);
  }, 1400);
  return { wildlife:placeholder, ticker:null, count:0, deferred:true };
}
