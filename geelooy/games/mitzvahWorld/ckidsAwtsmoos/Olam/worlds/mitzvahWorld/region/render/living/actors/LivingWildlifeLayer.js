// B"H
/** LivingWildlifeLayer.js — wildlife is first-playable, not an invisible afterthought. */
import { buildWildlifeRenderer, installWildlifeTicker } from "../../RegionWildlifeRenderer.js?compact=true&v=final-lootable-corpse-20260705-bh1";
import { markLiving } from "../LivingRegionLayers.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";

export function addWildlifeLayer(root, olam, report) {
  const started = performance.now();
  try {
    const wildlife = buildWildlifeRenderer(olam, report);
    wildlife.name = "wildlife_first_playable_multi_part_layer";
    root.add(wildlife);
    const ticker = installWildlifeTicker(olam, wildlife);
    const count = wildlife.children?.length || 0;
    olam.__livingRegionDeferredWildlife = { ok:true, count, immediate:true, elapsedMs:Math.round(performance.now() - started), at:Date.now(), seal:"first-playable-wildlife-layer-bh1" };
    markLiving("wildlife:first-playable-done", olam.__livingRegionDeferredWildlife);
    return { wildlife, ticker, count, deferred:false };
  } catch (error) {
    olam.__livingRegionDeferredWildlife = { ok:false, error:error?.message || String(error), elapsedMs:Math.round(performance.now() - started), at:Date.now(), seal:"first-playable-wildlife-layer-bh1" };
    markLiving("wildlife:first-playable-error", olam.__livingRegionDeferredWildlife);
    throw error;
  }
}
