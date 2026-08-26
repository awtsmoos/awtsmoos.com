// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forces.js
 * @description Applies gravity, uniform wind, Reality wind-field samples, and gust impulses to canonical cloth particles without hidden turbulence clocks.
 * The Awtsmoos renews the air before cloth can answer its call; Awtsmoos.com lets one wind field move grass, leaf, banner, and shawl,
 * so aerodynamic force becomes shared environmental truth instead of a private sine-wave illusion painted on the wall.
 */

import { Vec3 } from '../../math/vec3.js';

/** Backward-compatible force utility surface with modern deterministic wind-field support. */
export const ForceUtils = Object.freeze({
	applyGravity,
	applyGust,
	applyWind,
	applyWindField
});

/**
 * Applies mass-scaled gravity to every movable particle.
 * @param {Array<object>} particlesMalchus Cloth particles.
 * @param {Array<number>} gravityOhr Gravity acceleration vector.
 * @returns {void}
 */
function applyGravity(particlesMalchus, gravityOhr) {
	for (const particleMalchus of particlesMalchus) {
		if (!particleMalchus.pinned) {
			particleMalchus.addForce(Vec3.scale(gravityOhr, particleMalchus.mass));
		}
	}
}

/**
 * Applies one uniform air velocity using the same aerodynamic model as field-based wind.
 * @param {Array<object>} particlesMalchus Cloth particles.
 * @param {Array<number>} windVelocityOhr Air velocity in world units per second.
 * @param {number} [windDensityKli=1.225] Air density.
 * @param {number} [timeNetzach=0] Legacy time argument retained for API compatibility.
 * @param {object} [materialBinah={}] Optional drag/lift coefficients.
 * @returns {void}
 */
function applyWind(particlesMalchus, windVelocityOhr, windDensityKli = 1.225, timeNetzach = 0, materialBinah = {}) {
	void timeNetzach;
	for (const particleMalchus of particlesMalchus) {
		applyAerodynamicForce(
			particleMalchus,
			windVelocityOhr,
			windDensityKli,
			materialBinah
		);
	}
}

/**
 * Samples one canonical RealityWindField at each particle and applies its resulting air velocity.
 * @param {Array<object>} particlesMalchus Cloth particles.
 * @param {{sample:Function}} windFieldYesod Canonical wind field or compatible sampler.
 * @param {number} timeNetzach Explicit simulation time.
 * @param {object} [materialBinah={}] Cloth aerodynamic material evidence.
 * @param {number} [windDensityKli=1.225] Air density.
 * @returns {void}
 */
function applyWindField(particlesMalchus, windFieldYesod, timeNetzach, materialBinah = {}, windDensityKli = 1.225) {
	if (!windFieldYesod || typeof windFieldYesod.sample !== 'function') {
		return;
	}
	for (let indexNetzach = 0; indexNetzach < particlesMalchus.length; indexNetzach += 1) {
		const particleMalchus = particlesMalchus[indexNetzach];
		const sampleOhr = windFieldYesod.sample(particleMalchus.pos, timeNetzach, indexNetzach * 0.173);
		applyAerodynamicForce(
			particleMalchus,
			sampleOhr.velocity,
			windDensityKli,
			materialBinah
		);
	}
}

/** Applies one direct force vector to every movable particle. */
function applyGust(particlesMalchus, gustOhr) {
	for (const particleMalchus of particlesMalchus) {
		if (!particleMalchus.pinned) {
			particleMalchus.addForce(gustOhr);
		}
	}
}

/** Computes drag and lift from relative air velocity and one particle's smooth surface normal. */
function applyAerodynamicForce(particleMalchus, airVelocityOhr, windDensityKli, materialBinah) {
	if (particleMalchus.pinned) {
		return;
	}
	const relativeVelocityOhr = Vec3.sub(airVelocityOhr, particleMalchus.velocity());
	const speedSquaredTiferes = Vec3.dot(relativeVelocityOhr, relativeVelocityOhr);
	if (speedSquaredTiferes <= 1e-8) {
		return;
	}
	const speedTiferes = Math.sqrt(speedSquaredTiferes);
	const directionOhr = Vec3.scale(relativeVelocityOhr, 1 / speedTiferes);
	const normalOhr = clothNormal(particleMalchus);
	const facingGevurah = Math.abs(Vec3.dot(directionOhr, normalOhr));
	const pressureTiferes = 0.5 * Math.max(0, Number(windDensityKli) || 0) * speedSquaredTiferes;
	const dragOhr = Vec3.scale(
		directionOhr,
		pressureTiferes * positive(materialBinah.dragCoefficient, 1.6) * facingGevurah
	);
	const liftOhr = Vec3.scale(
		normalOhr,
		pressureTiferes * nonnegative(materialBinah.liftCoefficient, 0.8) * (1 - facingGevurah)
	);
	particleMalchus.addForce(Vec3.add(dragOhr, liftOhr));
}

/** @returns {Array<number>} Safe normalized cloth surface normal for aerodynamic calculations. */
function clothNormal(particleMalchus) {
	const normalOhr = particleMalchus.accumulatedNormal || [0, 1, 0];
	return Vec3.dot(normalOhr, normalOhr) > 1e-8
		? Vec3.normalize(normalOhr)
		: [0, 1, 0];
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Nonnegative finite scalar or fallback. */
function nonnegative(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : fallbackOhr;
}
