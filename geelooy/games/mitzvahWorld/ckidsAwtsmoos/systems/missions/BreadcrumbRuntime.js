// B"H
/** @file BreadcrumbRuntime.js @description Breadcrumb unlocks from completed missions to the next solo sub-zone. */
export const BreadcrumbRegistry = Object.freeze([{ from:"the_cave_warning", to:"hidden_cave_intro", zone:"hiddenCave" }, { from:"build_the_bridge", to:"forest_road", zone:"forestEdge" }]);
export function unlockedBreadcrumbs(player = {}) { const completed = player.missionState?.completed || {}; return BreadcrumbRegistry.filter(b => completed[b.from]); }
export function emitBreadcrumbs(olam) { const payload = { breadcrumbs:unlockedBreadcrumbs(olam?.player || olam?.chossid || {}) }; olam?.ayshPeula?.("ui event", "breadcrumbs", payload); return payload; }
export default { BreadcrumbRegistry, unlockedBreadcrumbs, emitBreadcrumbs };
