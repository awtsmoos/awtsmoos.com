/**
 * B"H
 * Fighter stats, tuned for real game feel.
 *
 * Movement was too slow and sticky. These numbers make the player cross the
 * arena with intention, jump cleanly, and feel punch/kick response instantly.
 */
export function statsFromDNA(dna) {
  return {
    accel: 1.08 * dna.speed,
    air: 0.58 * dna.speed,
    maxSpeed: 9.2 * dna.speed,
    jump: 15.6 * dna.recovery,
    mass: dna.mass,
    power: dna.power,
    shield: 100 * dna.mass,
    grab: 48 * dna.arm
  };
}
