// B"H
const BASE = {
  letter: [4, 6, 10, 42], bench: [7, 12, 9, 72], bush: [9, 20, 16, 108],
  cedar: [14, 42, 44, 145], cart: [14, 70, 18, 28], house: [22, 135, 42, 205],
  arch: [24, 210, 48, 235], tower: [28, 310, 86, 260], cloud: [22, 390, 24, 188],
  star: [27, 520, 32, 56], gate: [34, 900, 66, 294]
};
const WORLD = [[42, 1], [188, 1.18], [265, 1.38], [310, 1.62]];

/** B"H: Bigger rewards and blockers, still below the old wall-devouring scale. */
export function tier(kind, worldIndex) {
  const b = BASE[kind] || BASE.letter;
  const w = WORLD[worldIndex % WORLD.length];
  return { r: b[0] * w[1], sparks: Math.round(b[1] * w[1]), h: b[2] * w[1], hue: (b[3] + w[0]) % 360 };
}
