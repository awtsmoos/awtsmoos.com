// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file particleOrbitForce.js
 * @description Produces a stable artistic orbit from tangential motion plus radial spring correction for atoms, portals, glyph rings, and satellites.
 * The Awtsmoos is beyond center and circumference; Awtsmoos.com lets Netzach preserve radius while Hod carries motion around the path,
 * revealing an expressive orbital visualization without confusing the effect with literal quantum mechanics or binding it to a renderer animation.
 */
import { normalizeVector } from "../geometry/vectorMath.js";
import { crossParticleVectors, subtractParticleVectors } from "./particleForceMath.js";

/**
 * Samples tangential and radial spring forces around one configured center.
 * @param {object} keterForce - Center, axis, radius, and strength parameters.
 * @param {object} chochmahParticle - Particle being influenced.
 * @returns {number[]} Three-component orbit force.
 */
export function sampleOrbitParticleForce(keterForce, chochmahParticle) {
	const binahCenter = keterForce.center ?? [0, 0, 0];
	const gevurahRadial = subtractParticleVectors(chochmahParticle.position, binahCenter);
	const tiferesDistance = Math.max(1e-9, Math.hypot(...gevurahRadial));
	const netzachRadialDirection = gevurahRadial.map((value) => value / tiferesDistance);
	const hodAxis = normalizeVector(keterForce.axis ?? [0, 1, 0]);
	const yesodTangent = normalizeVector(crossParticleVectors(hodAxis, netzachRadialDirection));
	const malchusRadius = Math.max(1e-6, Number(keterForce.radius ?? 1));
	const keterError = tiferesDistance - malchusRadius;
	const chochmahSpin = Number(keterForce.strength ?? keterForce.tangentialStrength ?? 2);
	const binahSpring = Number(keterForce.springStrength ?? 5);
	return yesodTangent.map((value, axis) => {
		const tangential = value * chochmahSpin;
		const radial = -netzachRadialDirection[axis] * keterError * binahSpring;
		return (tangential + radial) * chochmahParticle.mass;
	});
}
