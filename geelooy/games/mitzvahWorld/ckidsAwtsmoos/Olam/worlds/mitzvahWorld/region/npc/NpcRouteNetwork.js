// B"H
/** @file NpcRouteNetwork.js @description Named village destinations and parser-clear road route anchors. */
function point(id, x, z) { return { id, x, z }; }
function positionX(house, fallback) { if (house.x !== undefined) return house.x; if (Array.isArray(house.position)) return house.position[0]; return fallback; }
function positionZ(house, fallback) { if (house.z !== undefined) return house.z; if (Array.isArray(house.position)) return house.position[1]; return fallback; }
function roadPoints(roads, key) { const road = roads && roads[key] ? roads[key] : {}; return Array.isArray(road.points) ? road.points : []; }
export function npcRouteNetwork(roads = {}, houses = []) {
  const destinations = { square:point("square",0,0), market:point("market",18,10), well:point("well",-10,16), field:point("field",-160,-55), orchard:point("orchard",128,-88), storage:point("storage",-112,-38), hills:point("hills",-230,128), roadGate:point("roadGate",-65,-18), watchHill:point("watchHill",-220,142), school:point("school",28,18) };
  houses.forEach((house, i) => { destinations[`home${i}`] = point(`home${i}`, positionX(house, -18 + i * 8), positionZ(house, -12)); });
  return { version:"npc-route-network-v3-parser-clear", destinations, routes:{ main:roadPoints(roads,"main"), farm:roadPoints(roads,"farm"), forest:roadPoints(roads,"forest") } };
}
