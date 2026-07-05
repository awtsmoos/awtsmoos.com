// B"H
/** LivingFriendlyNpcs.js — friendly villagers enter as their own small vessel. */
import { ensureChossidNpcs } from "../../../../npcs/EnsureChossidNpcs.js?v=deferred-npc-glb-20260705-bh1";
import { installRegionNpcRuntime } from "../../RegionNpcRuntime.js?v=deferred-npc-glb-20260705-bh1";

export async function addFriendlyNpcs(olam, scene, report) {
  let added = [];
  try { added = await ensureChossidNpcs({ olam, scene }); }
  catch (error) { olam.__livingRegionNpcError = error?.message || String(error); }
  const ticker = installRegionNpcRuntime(olam, report);
  return { added, ticker, count: added.length };
}
