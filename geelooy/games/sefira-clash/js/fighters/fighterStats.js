/**
 * B"H
 * Fighter stats tuned for larger vertical play.
 *
 * Chapter 99: the jump was too small for a world this tall. The body now rises
 * with courage, double-jumps with readable height, and still lands fast enough
 * for brawling rather than floating forever.
 */
export function statsFromDNA(dna) {
  return {
    accel: 1.9 * dna.speed,
    air: 0.54 * dna.speed,
    maxSpeed: 13.8 * dna.speed,
    jump: 19.6 * dna.recovery,
    mass: dna.mass,
    power: dna.power,
    shield: 100 * dna.mass,
    grab: 48 * dna.arm
  };
}
