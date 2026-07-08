// B"H
/** Inn runtime: rest, rumors, hearth binding, and a social hub. */
import { bindHearth } from "./HearthRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function restAtInn(playerOrOlam = {}, place = { id:"village_inn" }) {
  const legacyOlam = playerOrOlam.ayshPeula || playerOrOlam.player || playerOrOlam.chossid;
  const player = legacyOlam ? (playerOrOlam.player || playerOrOlam.chossid || {}) : playerOrOlam;
  const rested = { restedXpBonus:true, restedAt:Date.now(), durationMs:30 * 60 * 1000, place };
  globalThis.dispatchEvent?.(new CustomEvent("mitzvah-world:rested", { detail:{ player, rested } }));
  if (legacyOlam) {
    playerOrOlam.rested = rested;
    playerOrOlam.ayshPeula?.("ui event", "innRest", { rested });
    return { rested };
  }
  return rested;
}

export function createInnRuntime(store = {}) {
  return {
    rest(player = {}) { return restAtInn(player); },
    bindHome(place) { return bindHearth(place || { id:"village_inn", x:4, y:0, z:-6 }); },
    rumors() { return (store.rumors || []).slice(-3); },
    menu() { return ["Rest here", "Bind home return", "Hear village rumors"]; }
  };
}

export default createInnRuntime;
