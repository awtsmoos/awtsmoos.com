// B"H
/**
 * @file RoadNetwork.js
 * @description Chapter 984: roads become movement memory, not decoration.
 */
export function buildRoadNetwork() {
  const roads = {
    main: road("main", "yellowBrick", 7, [[-205, -64], [-130, -38], [-55, -12], [0, 0], [72, 22], [142, 58], [215, 112]], .95),
    farm: road("farm", "dirt", 5, [[-15, -6], [-72, -28], [-132, -54], [-190, -72]], .66),
    orchard: road("orchard", "packedEarth", 4, [[18, -8], [74, -42], [128, -88], [180, -122]], .48),
    forest: road("forestTrail", "leafTrail", 3.2, [[72, 20], [118, 60], [168, 90], [220, 115]], .32),
    animalTrails: [
      road("rabbitRun", "softTrail", 1.6, [[120, -120], [75, -95], [30, -60], [-40, -42]], .16),
      road("deerTrace", "softTrail", 2.2, [[210, 115], [165, 68], [98, 26], [30, 6]], .18),
      road("goatRidge", "stoneDust", 2.4, [[-285, 165], [-238, 138], [-198, 112], [-142, 86]], .2)
    ],
    marshBoardwalk: road("marshBoardwalk", "wood", 3.4, [[72, -94], [102, -130], [138, -158]], .38)
  };
  return { version: "road-network-v2-systemic", ...roads, bridges: bridgePoints(roads), intersections: intersectionPoints(roads) };
}

function road(id, material, width, points, traffic) { return { id, material, width, points, traffic, length: pathLength(points) }; }
function pathLength(points) { let n = 0; for (let i = 1; i < points.length; i++) n += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]); return Math.round(n); }
function bridgePoints() { return [{ id: "marsh-bridge", x: 105, z: -128, road: "marshBoardwalk" }]; }
function intersectionPoints() { return [{ id: "village-center", x: 0, z: 0 }, { id: "forest-fork", x: 72, z: 22 }, { id: "farm-fork", x: -72, z: -28 }]; }
