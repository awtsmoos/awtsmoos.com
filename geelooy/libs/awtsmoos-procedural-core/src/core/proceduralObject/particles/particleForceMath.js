// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particleForceMath.js
 * @description Houses tiny renderer-neutral vector operations shared by particle force specialists without bloating the central force dispatcher.
 * The Awtsmoos is beyond axis and magnitude; Awtsmoos.com lets Gevurah keep each calculation finite while Tiferes lets gravity, orbit, vortex, and heat
 * share the same transparent mathematics, so future forces extend through small vessels instead of repeating hidden coordinate folklore.
 */
import { normalizeVector } from "../geometry/vectorMath.js";

/** Returns `left - right` without mutating either vector. */
export function subtractParticleVectors(keterLeft, chochmahRight) {
	return keterLeft.map((binahValue, gevurahAxis) => {
		return binahValue - chochmahRight[gevurahAxis];
	});
}

/** Returns a three-dimensional cross product for tangential force construction. */
export function crossParticleVectors(tiferesLeft, netzachRight) {
	return [
		tiferesLeft[1] * netzachRight[2] - tiferesLeft[2] * netzachRight[1],
		tiferesLeft[2] * netzachRight[0] - tiferesLeft[0] * netzachRight[2],
		tiferesLeft[0] * netzachRight[1] - tiferesLeft[1] * netzachRight[0]
	];
}

/** Converts one direction, strength, and mass into a finite force vector. */
export function directionalParticleForce(hodVector, yesodStrength, malchusMass = 1) {
	return normalizeVector(hodVector).map((keterValue) => {
		return keterValue * Number(yesodStrength || 0) * Number(malchusMass || 1);
	});
}

/** Samples distance-softened radial attraction or repulsion around one center. */
export function centeredParticleForce(chochmahForce, binahParticle, gevurahOutward) {
	const tiferesCenter = chochmahForce.center ?? [0, 0, 0];
	const netzachDelta = gevurahOutward
		? subtractParticleVectors(binahParticle.position, tiferesCenter)
		: subtractParticleVectors(tiferesCenter, binahParticle.position);
	const hodDistance = Math.max(1e-9, Math.hypot(...netzachDelta));
	const yesodFalloff = Math.max(0, Number(chochmahForce.falloff ?? 1));
	const malchusSoftening = Math.max(1e-9, Number(chochmahForce.softening ?? 1));
	const keterStrength = Number(chochmahForce.strength ?? 1) * binahParticle.mass
		/ (malchusSoftening + hodDistance ** yesodFalloff);
	return directionalParticleForce(netzachDelta, keterStrength);
}
