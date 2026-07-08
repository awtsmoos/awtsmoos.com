// B"H
/** @file CollectSourceRuntime.js @description Strict collection source validation for nearby sparks, pages, herbs, and rare drops. */
import { collectItem } from "./CollectRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function posOf(x) { return x?.mesh?.position || x?.position || { x:0, z:0 }; }
function dist(a, b) { return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)); }
const STARTER_SOURCES = Object.freeze([
  { id:"spark_fragment", itemId:"spark_fragment", x:4, z:4, radius:18, label:"village spark" },
  { id:"siddur_page", itemId:"siddur_page", x:-6, z:10, radius:18, label:"loose siddur page" },
  { id:"healing_herb", itemId:"healing_herb", x:-22, z:12, radius:28, label:"healer herb bed" },
  { id:"bridge_wood", itemId:"bridge_wood", x:-54, z:-18, radius:28, label:"broken fence wood" }
]);
function liveSources(olam) { return (olam?.__collectSources || []).filter(Boolean); }
function allSources(olam) { return [...liveSources(olam), ...STARTER_SOURCES]; }
function matchSource(source, itemId) { return source.itemId === itemId || source.id === itemId || source.baseId === itemId; }
export function nearestCollectSource(olam, itemId = "spark_fragment") {
  const player = playerOf(olam), pp = posOf(player); if (!player) return null;
  let best = null, bestD = Infinity;
  for (const source of allSources(olam).filter(s => matchSource(s, itemId))) { const d = dist(pp, source); if (d < bestD) { best = source; bestD = d; } }
  return best && bestD <= (best.radius || 10) ? { source:best, distance:bestD } : null;
}
export function collectFromNearbySource(olam, itemId = "spark_fragment", options = {}) {
  const hit = options.allowAnywhere ? { source:{ itemId }, distance:0 } : nearestCollectSource(olam, itemId);
  if (!hit) { olam?.ayshPeula?.("ui event", "collect", { ok:false, itemId, reason:"no-nearby-source" }); return { ok:false, reason:"no-nearby-source" }; }
  const item = collectItem(olam, hit.source.itemId || itemId, options); return { ok:Boolean(item), item, source:hit.source, distance:hit.distance };
}
export function registerCollectSource(olam, source = {}) { olam.__collectSources ||= []; olam.__collectSources.push(source); return source; }
export default { nearestCollectSource, collectFromNearbySource, registerCollectSource };
