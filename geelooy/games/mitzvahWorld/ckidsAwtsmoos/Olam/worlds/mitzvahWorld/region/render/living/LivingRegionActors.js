// B"H
/**
 * @file LivingRegionActors.js
 * @description Default village must be alive: friendly NPCs and animals enter
 * early, but split away from cottages so every spark is inspectable.
 */
import { ensureChossidNpcs } from "../../../npcs/EnsureChossidNpcs.js?v=default-test-npcs-animals-20260702-bh1";
import { installRegionNpcRuntime } from "../RegionNpcRuntime.js?v=default-test-npcs-animals-20260702-bh1";
import { buildWildlifeRenderer, installWildlifeTicker } from "../RegionWildlifeRenderer.js?v=default-test-npcs-animals-20260702-bh1";
import { addLayer } from "./LivingRegionLayers.js?v=default-test-npcs-animals-20260702-bh1";

export async function addFriendlyNpcs(olam, scene, report) {
  let added = [];
  try { added = await ensureChossidNpcs({ olam, scene }); }
  catch (error) { olam.__livingRegionNpcError = error?.message || String(error); }
  const ticker = installRegionNpcRuntime(olam, report);
  return { added, ticker, count: added.length };
}

export function addWildlifeLayer(root, olam, report) {
  const wildlife = addLayer(root, "wildlife", () => buildWildlifeRenderer(olam, report));
  const ticker = installWildlifeTicker(olam, wildlife);
  return { wildlife, ticker, count: wildlife.children?.length || 0 };
}
