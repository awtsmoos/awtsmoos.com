// B"H
import { FOOT_GROUND_EPSILON, PLAYER_VISIBLE_BODY_CLEARANCE_Y } from "./playerGrounding/FootGroundConstants.js?v=no-alert-perf-jump-20260701-bh9";
import { applyPlayerFootGrounding } from "./playerGrounding/ApplyPlayerFootGrounding.js?v=no-alert-perf-jump-20260701-bh9";
export { FOOT_GROUND_EPSILON, PLAYER_VISIBLE_BODY_CLEARANCE_Y };
export function clampVisibleBodyAboveFeet(player) { return applyPlayerFootGrounding(player); }
if (typeof window !== "undefined") window.__MITZVAH_PLAYER_GROUNDING_DIAG__ = () => { const olam = window.__AWTSMOOS_GET_ACTIVE_OLAM__?.() || window.olam || window.mana?.olam || null; const player = olam?.player || olam?.chossid || null; return player?.__lastVisualGroundClamp || { warnings:["player grounding diagnostic not ready"] }; };
export default { FOOT_GROUND_EPSILON, PLAYER_VISIBLE_BODY_CLEARANCE_Y, clampVisibleBodyAboveFeet };
