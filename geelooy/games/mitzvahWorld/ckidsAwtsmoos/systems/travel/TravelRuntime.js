// B"H
/** @file TravelRuntime.js @description Flight-master-like solo route unlock and travel state. */
import TravelRouteRegistry, { routeById } from "./TravelRouteRegistry.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function ensureTravelState(olam) { const p = playerOf(olam); if (!p) return null; p.travelState ||= { unlocked:{ village:true }, routes:{} }; return p.travelState; }
export function unlockRoute(olam, routeId) { const route = routeById(routeId), s = ensureTravelState(olam); if (!route || !s) return false; s.routes[routeId] = true; s.unlocked[route.to] = true; olam?.ayshPeula?.("ui event", "travel", { unlocked:routeId }); return route; }
export function travelPayload(olam) { return { routes:TravelRouteRegistry, state:ensureTravelState(olam) || {} }; }
export default { ensureTravelState, unlockRoute, travelPayload };
