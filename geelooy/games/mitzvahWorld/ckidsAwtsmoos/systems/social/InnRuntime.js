// B"H
/** @file InnRuntime.js @description Inn rest, hearth bind, rested XP, and logout-rest owner. */
import { grantRestedXp, bindRestedInn, restedPayload } from "../progression/RestedXpRuntime.js";
import { bindHearth } from "./HearthRuntime.js";
export function restAtInn(olam, innId = "village_inn") { const p = olam?.player || olam?.chossid; if (p) { p.hp = p.maxHp || p.hp || 100; p.koach = p.maxKoach || p.koach || 50; } const rested = grantRestedXp(olam, 120); bindRestedInn(olam, innId); const hearth = bindHearth(olam, innId); const payload = { player:p, rested, hearth, restedPayload:restedPayload(olam) }; olam?.ayshPeula?.("ui event", "innRest", payload); olam?.ayshPeula?.("ui event", "effectsOverlay", { text:"Rested at the inn", color:"#d7c8ff" }); return payload; }
export function innPayload(olam, innId = "village_inn") { return { innId, rested:restedPayload(olam), hearth:(olam?.player || olam?.chossid)?.hearth || null }; }
export default { restAtInn, innPayload };
