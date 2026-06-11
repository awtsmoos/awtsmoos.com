/** B"H — stats translate mystical tendency into physics-readable numbers. */
export function statsFromDNA(dna) { return { accel:.46*dna.speed, jump:12.2*dna.recovery, mass:dna.mass, power:dna.power, air:0.22*dna.speed, shield:100*dna.mass, grab:42*dna.arm }; }
