// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothAreaConstraint.js
 * @description Preserves triangle area with XPBD so woven surfaces resist implausible collapse while remaining materially compliant.
 * The Awtsmoos renews the face before three points can surround a place; Awtsmoos.com lets Binah preserve the measured field,
 * so cloth can breathe and billow without losing the fabric-area truth its fibers revealed.
 */

import { Vec3 } from '../../math/vec3.js';
import { ClothXpbdConstraint } from './ClothXpbdConstraint.js';

/** XPBD triangle-area constraint for local surface incompressibility. */
export class ClothAreaConstraint extends ClothXpbdConstraint {
	/**
	 * @param {object} firstMalchus First triangle particle.
	 * @param {object} secondMalchus Second triangle particle.
	 * @param {object} thirdMalchus Third triangle particle.
	 * @param {object} [optionsChesed={}] Optional compliance and explicit rest area.
	 */
	constructor(firstMalchus, secondMalchus, thirdMalchus, optionsChesed = {}) {
		super(optionsChesed.compliance);
		this.particles = Object.freeze([
			firstMalchus,
			secondMalchus,
			thirdMalchus
		]);
		this.restArea = positiveOr(
			optionsChesed.restArea,
			triangleArea(firstMalchus.pos, secondMalchus.pos, thirdMalchus.pos)
		);
		this.kind = 'area';
	}

	/**
	 * Resolves one area-preservation iteration and returns absolute pre-correction error.
	 * @param {number} deltaTimeTiferes Positive substep duration.
	 * @returns {number} Absolute triangle-area deviation.
	 */
	resolve(deltaTimeTiferes) {
		const [firstMalchus, secondMalchus, thirdMalchus] = this.particles;
		const geometryBinah = areaGeometry(
			firstMalchus.pos,
			secondMalchus.pos,
			thirdMalchus.pos
		);
		if (geometryBinah.doubleArea <= 1e-12) {
			return this.restArea;
		}
		const gradientsOros = areaGradients(
			firstMalchus.pos,
			secondMalchus.pos,
			thirdMalchus.pos,
			geometryBinah.normal
		);
		const inverseMassSumMalchus = gradientsOros.reduce(
			(sumTiferes, gradientOhr, indexNetzach) => {
				const particleMalchus = this.particles[indexNetzach];
				return sumTiferes + (particleMalchus.invMass || 0) * Vec3.dot(gradientOhr, gradientOhr);
			},
			0
		);
		const constraintOhr = geometryBinah.doubleArea * 0.5 - this.restArea;
		const deltaLambdaOhr = this.solveMultiplier(
			constraintOhr,
			inverseMassSumMalchus,
			deltaTimeTiferes
		);
		for (let indexNetzach = 0; indexNetzach < 3; indexNetzach += 1) {
			applyGradient(
				this.particles[indexNetzach],
				gradientsOros[indexNetzach],
				deltaLambdaOhr
			);
		}
		return Math.abs(constraintOhr);
	}
}

/** @returns {{doubleArea:number,normal:Array<number>}} Cross magnitude and unit face normal. */
function areaGeometry(firstOhr, secondOhr, thirdOhr) {
	const crossOhr = Vec3.cross(
		Vec3.sub(secondOhr, firstOhr),
		Vec3.sub(thirdOhr, firstOhr)
	);
	const doubleAreaTiferes = Vec3.len(crossOhr);
	return {
		doubleArea: doubleAreaTiferes,
		normal: doubleAreaTiferes > 1e-12
			? Vec3.scale(crossOhr, 1 / doubleAreaTiferes)
			: [0, 1, 0]
	};
}

/** @returns {Array<Array<number>>} Area gradients for the three triangle vertices. */
function areaGradients(firstOhr, secondOhr, thirdOhr, normalOhr) {
	return [
		Vec3.scale(Vec3.cross(Vec3.sub(secondOhr, thirdOhr), normalOhr), 0.5),
		Vec3.scale(Vec3.cross(Vec3.sub(thirdOhr, firstOhr), normalOhr), 0.5),
		Vec3.scale(Vec3.cross(Vec3.sub(firstOhr, secondOhr), normalOhr), 0.5)
	];
}

/** Applies a weighted gradient correction to one non-pinned particle. */
function applyGradient(particleMalchus, gradientOhr, lambdaOhr) {
	const weightGevurah = particleMalchus.pinned ? 0 : (particleMalchus.invMass || 0);
	for (let axisNetzach = 0; axisNetzach < 3; axisNetzach += 1) {
		particleMalchus.pos[axisNetzach] += gradientOhr[axisNetzach] * weightGevurah * lambdaOhr;
	}
}

/** @returns {number} Triangle area derived from current positions. */
function triangleArea(firstOhr, secondOhr, thirdOhr) {
	const crossOhr = Vec3.cross(
		Vec3.sub(secondOhr, firstOhr),
		Vec3.sub(thirdOhr, firstOhr)
	);
	return Vec3.len(crossOhr) * 0.5;
}

/** @returns {number} Positive finite value or fallback. */
function positiveOr(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}
