// B"H
/**
 * @file cottageContract.js
 * @description
 * Chapter 345: One doorway covenant for visual, door, and collider.
 *
 * The Awtsmoos widens the passage and lowers the floor covenant. The visual
 * brick skip-rectangle, the swinging leaf, and the invisible house collider all
 * drink from these same numbers, so no gray blocker or hidden jamb survives.
 */
export const COTTAGE = Object.freeze({
  scale: 4.8,
  halfWidth: 3.38,
  halfDepth: 2.36,
  wallHeight: 2.78,
  wallThickness: 0.16,
  floorTop: 0.012,
  door: Object.freeze({
    halfWidth: 0.46,
    bottom: 0.012,
    top: 0.9,
    faceGap: 0.155,
    looseDoorZ: -0.012,
    trimGap: 0.035
  }),
  roof: Object.freeze({ eaveY: 2.86, ridgeY: 3.46, overhang: 0.42 })
});

export const facadeZ = () => COTTAGE.halfDepth;
export const world = value => value * COTTAGE.scale;
export const worldSize = values => values.map(world);

export function doorLocalRect(pad = 0) {
  const d = COTTAGE.door;
  return Object.freeze({ xMin: -d.halfWidth - pad, xMax: d.halfWidth + pad, yMin: d.bottom - pad, yMax: d.top + pad, pad });
}

export function doorwayLocalOffset() {
  return Object.freeze({ x: 0, y: 0, z: facadeZ() + COTTAGE.door.faceGap });
}

export function doorWorldMetrics() {
  const d = COTTAGE.door;
  return Object.freeze({
    width: world(d.halfWidth * 2),
    clearHeight: world(d.top - d.bottom),
    top: world(d.top),
    bottom: world(d.bottom),
    floorTop: world(d.bottom),
    centerY: world((d.top + d.bottom) / 2)
  });
}

export function colliderMetrics() {
  const m = doorWorldMetrics();
  return Object.freeze({
    width: world(COTTAGE.halfWidth * 2),
    depth: world(COTTAGE.halfDepth * 2),
    height: world(COTTAGE.wallHeight),
    thickness: world(COTTAGE.wallThickness),
    floorTop: m.floorTop,
    doorWidth: m.width + 0.72,
    doorClearHeight: m.top + 0.34
  });
}

export function frontWallPanels() {
  const d = COTTAGE.door, w = COTTAGE.halfWidth, z = facadeZ(), h = COTTAGE.wallHeight;
  const sideW = Math.max(0.1, w - d.halfWidth);
  return Object.freeze([
    { name: "front_wall_left_corner_to_jamb", position: [-(d.halfWidth + sideW / 2), h / 2, z], scale: [sideW, h, COTTAGE.wallThickness] },
    { name: "front_wall_right_jamb_to_corner", position: [d.halfWidth + sideW / 2, h / 2, z], scale: [sideW, h, COTTAGE.wallThickness] },
    { name: "front_wall_lintel_true_facade", position: [0, (d.top + h) / 2, z], scale: [d.halfWidth * 2, h - d.top, COTTAGE.wallThickness] }
  ]);
}

export function doorLeafLocal() {
  const d = COTTAGE.door;
  return Object.freeze({
    width: d.halfWidth * 2 - 0.018,
    height: d.top - d.bottom - 0.018,
    thickness: 0.058,
    centerY: (d.top + d.bottom) / 2,
    hingeX: -d.halfWidth + 0.009,
    z: d.looseDoorZ
  });
}
