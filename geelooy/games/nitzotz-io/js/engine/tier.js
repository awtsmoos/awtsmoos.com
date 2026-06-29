// B"H
const BASE = {
  letter: [5, 5, 8, 42], bench: [7, 9, 8, 72], bush: [8, 15, 13, 108],
  cedar: [12, 30, 28, 145], cart: [13, 48, 16, 28], house: [18, 82, 28, 205],
  arch: [20, 128, 32, 235], tower: [22, 170, 48, 260], cloud: [18, 230, 16, 188],
  star: [24, 330, 24, 56], gate: [26, 560, 36, 294]
};
const WORLD = [[42, 1], [188, 1.16], [265, 1.3], [310, 1.45]];

/** B"H: Power remains, but scale bows to playability. */
export function tier(kind, worldIndex) {
  const b = BASE[kind] || BASE.letter;
  const w = WORLD[worldIndex % WORLD.length];
  return { r: b[0] * w[1], sparks: Math.round(b[1] * w[1]), h: b[2] * w[1], hue: (b[3] + w[0]) % 360 };
}
