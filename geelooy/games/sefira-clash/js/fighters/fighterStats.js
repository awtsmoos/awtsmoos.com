/**
 * B"H
 * Fighter stats, tuned for fast readable ground combat.
 *
 * Chapter 80: walking was exile. Ground speed now carries the player across
 * the platform with intent, while air drift stays useful but no longer feels
 * faster than ordinary movement.
 */
export function statsFromDNA(dna) {
  return {
    accel: 1.85 * dna.speed,
    air: 0.46 * dna.speed,
    maxSpeed: 13.4 * dna.speed,
    jump: 15.6 * dna.recovery,
    mass: dna.mass,
    power: dna.power,
    shield: 100 * dna.mass,
    grab: 48 * dna.arm
  };
}
