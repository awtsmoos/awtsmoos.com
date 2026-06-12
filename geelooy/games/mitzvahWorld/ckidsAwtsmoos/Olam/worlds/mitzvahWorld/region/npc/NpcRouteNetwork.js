// B"H
/**
 * @file NpcRouteNetwork.js
 * @description Chapter 1001: named destinations become village navigation anchors.
 */
export function npcRouteNetwork(roads = {}, houses = []) {
  const destinations = {
    square: point("square", 0, 0), market: point("market", 18, 10), well: point("well", -10, 16),
    field: point("field", -160, -55), orchard: point("orchard", 128, -88), storage: point("storage", -112, -38),
    hills: point("hills", -230, 128), roadGate: point("roadGate", -65, -18), watchHill: point("watchHill", -220, 142),
    school: point("school", 28, 18)
  };
  houses.forEach((house, i) => { destinations[`home${i}`] = point(`home${i}`, house.x ?? house.position?.[0] ?? -18 + i * 8, house.z ?? house.position?.[1] ?? -12); });
  return { version: "npc-route-network-v2", destinations, routes: { main: roads.main?.points || [], farm: roads.farm?.points || [], forest: roads.forest?.points || [] } };
}
function point(id, x, z) { return { id, x, z }; }
