// B"H
/**
 * Compatibility entrypoint for the active physics imports. The real work lives
 * in tiny playerGrounding modules so the Chossid GLB soles, capsule bottom, and
 * terrain ground share one numeric contract.
 */
import { FOOT_GROUND_EPSILON } from "./playerGrounding/FootGroundConstants.js?v=player-foot-ground-contract-20260701-bh3";
import { applyPlayerFootGrounding } from "./playerGrounding/ApplyPlayerFootGrounding.js?v=player-foot-ground-contract-20260701-bh3";

export { FOOT_GROUND_EPSILON };

export function clampVisibleBodyAboveFeet(player) {
  return applyPlayerFootGrounding(player);
}

if (typeof window !== "undefined") {
  window.__MITZVAH_PLAYER_GROUNDING_DIAG__ ||= () => {
    const olam = window.__AWTSMOOS_GET_ACTIVE_OLAM__?.() || window.olam || window.mana?.olam || null;
    const player = olam?.player || olam?.chossid || null;
    return player?.__lastVisualGroundClamp || window.__AWTSMOOS_LAST_PLAYER_PROBE__?.visualClamp || { warnings:["player grounding diagnostic not ready"] };
  };
}

export default { FOOT_GROUND_EPSILON, clampVisibleBodyAboveFeet };
