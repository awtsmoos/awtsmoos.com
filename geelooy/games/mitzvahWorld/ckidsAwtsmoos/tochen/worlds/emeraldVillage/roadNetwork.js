// B"H
/**
 * @file RoadNetwork.js
 * @description
 * Roads that connect every property by front gates, main arteries, and local walkways.
 */

function gateForProperty(prop) {
  const lot = prop.lot || { width: 40, depth: 40 };
  const houseOffset = prop.houseOffset || { x: 0, z: 0 };
  const frontZ = prop.center.z >= 0 ? prop.center.z - lot.depth / 2 : prop.center.z + lot.depth / 2;

  return {
    x: prop.center.x + (houseOffset.x || 0) * 0.25,
    z: frontZ
  };
}

function laneToNearestArtery(prop) {
  const gate = gateForProperty(prop);
  const distToMain = Math.abs(gate.z);
  const distToCross = Math.abs(gate.x);

  if (distToMain <= distToCross) {
    return [[gate.x, 0], [gate.x, gate.z]];
  }

  return [[0, gate.z], [gate.x, gate.z]];
}

class RoadGenerator {
  static generate(properties) {
    const roads = [];

    roads.push({
      id: "main_avenue",
      name: "Emerald_Avenue",
      points: [[-600, 0], [-300, 0], [0, 0], [300, 0], [600, 0]],
      width: 12,
      sidewalkWidth: 3,
      sidewalkHeight: 0.4,
      isSolid: true
    });

    roads.push({
      id: "transverse_artery",
      name: "Simcha_Street",
      points: [[0, -600], [0, -300], [0, 0], [0, 300], [0, 600]],
      width: 10,
      sidewalkWidth: 2.5,
      sidewalkHeight: 0.35,
      isSolid: true
    });

    properties.forEach(prop => {
      const lane = laneToNearestArtery(prop);
      const gate = gateForProperty(prop);
      const door = {
        x: prop.center.x + (prop.houseOffset?.x || 0),
        z: prop.center.z + (prop.houseOffset?.z || 0)
      };

      roads.push({
        id: `road_to_${prop.id}`,
        name: `${prop.name}_Lane`,
        points: lane,
        width: 6,
        sidewalkWidth: 1.5,
        sidewalkHeight: 0.2,
        isSolid: true
      });

      roads.push({
        id: `walkway_${prop.id}`,
        name: `${prop.name}_Front_Walk`,
        points: [[gate.x, gate.z], [door.x, door.z]],
        width: 2.4,
        sidewalkWidth: 0,
        sidewalkHeight: 0.05,
        material: "stone",
        isSolid: true
      });
    });

    const ringRadius = 450;
    const ringPoints = [];
    const segments = 16;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      ringPoints.push([Math.cos(a) * ringRadius, Math.sin(a) * ringRadius]);
    }

    roads.push({
      id: "outer_ring",
      name: "Sefirot_Loop",
      points: ringPoints,
      width: 8,
      sidewalkWidth: 2,
      sidewalkHeight: 0.3,
      isSolid: true
    });

    return roads;
  }
}

export const ROAD_NETWORK = RoadGenerator;
