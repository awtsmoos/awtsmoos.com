// B"H

/** Create the player vessel: fast enough to feel like a spark, not a cart. */
export function createPlayer() {
  return { x: 0, y: 0, z: 0, r: 22, h: 36, speed: 500, glow: 0.25, combo: 1, comboT: 0 };
}

/** Create a camera that starts above the action, already breathing. */
export function createCamera() {
  return { x: 0, y: -760, z: 560, targetZ: 24, angle: 0, distance: 760, shake: 0, victory: 0 };
}

/** Danger state prevents repeated hits from becoming unfair oblivion. */
export function createDanger() {
  return { cooldown: 0, hits: 0, warn: 0 };
}
