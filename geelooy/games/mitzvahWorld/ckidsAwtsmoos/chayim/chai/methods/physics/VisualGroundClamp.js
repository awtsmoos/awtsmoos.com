// B"H
/**
 * Compatibility entrypoint for the active physics imports. The visible body is
 * sealed every frame by existing playerGrounding modules; no extra files here.
 */
import { FOOT_GROUND_EPSILON } from "./playerGrounding/FootGroundConstants.js?v=player-visible-above-ground-20260701-bh5";
import { applyPlayerFootGrounding } from "./playerGrounding/ApplyPlayerFootGrounding.js?v=player-visible-above-ground-20260701-bh5";
export { FOOT_GROUND_EPSILON };
export function clampVisibleBodyAboveFeet(player) { return applyPlayerFootGrounding(player); }
if (typeof window !== "undefined") {
  window.__MITZVAH_PLAYER_GROUNDING_DIAG__ = () => {
    const olam = window.__AWTSMOOS_GET_ACTIVE_OLAM__?.() || window.olam || window.mana?.olam || null;
    const player = olam?.player || olam?.chossid || null;
    return player?.__lastVisualGroundClamp || { warnings:["player grounding diagnostic not ready without worker clone probe"] };
  };
}
export default { FOOT_GROUND_EPSILON, clampVisibleBodyAboveFeet };
