// B"H
const BASE = {
  letter: [4, 6, 10, 42], bench: [7, 14, 9, 72], bush: [9, 24, 16, 108],
  cedar: [15, 50, 44, 145], cart: [15, 80, 18, 28], house: [23, 158, 42, 205],
  arch: [25, 245, 48, 235], tower: [30, 370, 86, 260], cloud: [23, 450, 24, 188],
  star: [28, 620, 32, 56], gate: [36, 1050, 66, 294]
};
const WORLD = [[42, 1], [188, 1.2], [265, 1.42], [310, 1.68]];

/** Rewards are sharper now: the player must choose prey, danger, and timing. */
export function tier(kind, worldIndex) {
  const base = BASE[kind] || BASE.letter;
  const world = WORLD[worldIndex % WORLD.length];
  return { r: base[0] * world[1], sparks: Math.round(base[1] * world[1]), h: base[2] * world[1], hue: (base[3] + world[0]) % 360 };
}
