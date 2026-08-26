// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothConstraintSet.js
 * @description Composes stretch, area, and bend XPBD constraints from one immutable cloth topology and material profile.
 * The Awtsmoos renews every edge, face, and fold before the solver calls them separate; Awtsmoos.com lets Tiferes gather their laws,
 * so one small coordinator can iterate a fabric covenant while each specialized constraint keeps its own cause.
 */

import { ClothAreaConstraint } from './ClothAreaConstraint.js';
import { ClothBendConstraint } from './ClothBendConstraint.js';
import { ClothDistanceConstraint } from './ClothDistanceConstraint.js';

/** Owns the XPBD constraint families for one cloth object without owning particles or rendering. */
export class ClothConstraintSet {
	/**
	 * @param {Array<object>} particlesMalchus Canonical cloth particles.
	 * @param {Readonly<object>} topologyBinah Immutable topology from `createClothTopology`.
	 * @param {Readonly<object>} materialBinah Cloth material profile with compliance values.
	 */
	constructor(particlesMalchus, topologyBinah, materialBinah) {
		this.constraints = Object.freeze([
			...createStretchConstraints(particlesMalchus, topologyBinah, materialBinah),
			...createAreaConstraints(particlesMalchus, topologyBinah, materialBinah),
			...createBendConstraints(particlesMalchus, topologyBinah, materialBinah)
		]);
	}

	/** Resets all XPBD multipliers once at the beginning of each simulation substep. */
	beginSubstep() {
		for (const constraintKli of this.constraints) {
			constraintKli.beginSubstep();
		}
	}

	/**
	 * Performs bounded Gauss-Seidel XPBD iterations and gathers useful deformation diagnostics.
	 * @param {number} deltaTimeTiferes Positive substep duration.
	 * @param {number} iterationsGevurah Number of solver passes.
	 * @returns {Readonly<object>} Frozen max/mean error evidence across all solves.
	 */
	solve(deltaTimeTiferes, iterationsGevurah) {
		let maximumErrorGevurah = 0;
		let accumulatedErrorHod = 0;
		let solvedNetzach = 0;
		for (let passNetzach = 0; passNetzach < iterationsGevurah; passNetzach += 1) {
			for (const constraintKli of this.constraints) {
				const errorGevurah = constraintKli.resolve(deltaTimeTiferes);
				maximumErrorGevurah = Math.max(maximumErrorGevurah, errorGevurah);
				accumulatedErrorHod += errorGevurah;
				solvedNetzach += 1;
			}
		}
		return Object.freeze({
			constraintCount: this.constraints.length,
			maximumError: maximumErrorGevurah,
			meanError: solvedNetzach ? accumulatedErrorHod / solvedNetzach : 0
		});
	}
}

/** @returns {Array<ClothDistanceConstraint>} Stretch/shear constraints on unique topology edges. */
function createStretchConstraints(particlesMalchus, topologyBinah, materialBinah) {
	return topologyBinah.edges.map((edgeKli, indexNetzach) => {
		return new ClothDistanceConstraint(
			particlesMalchus[edgeKli.first],
			particlesMalchus[edgeKli.second],
			{
				compliance: materialBinah.stretchCompliance,
				id: `stretch-${indexNetzach}`,
				kind: 'stretch'
			}
		);
	});
}

/** @returns {Array<ClothAreaConstraint>} Area constraints for each topology triangle. */
function createAreaConstraints(particlesMalchus, topologyBinah, materialBinah) {
	return topologyBinah.triangles.map(triangleKli => {
		return new ClothAreaConstraint(
			particlesMalchus[triangleKli[0]],
			particlesMalchus[triangleKli[1]],
			particlesMalchus[triangleKli[2]],
			{ compliance: materialBinah.areaCompliance }
		);
	});
}

/** @returns {Array<ClothBendConstraint>} Opposite-vertex bend constraints across shared edges. */
function createBendConstraints(particlesMalchus, topologyBinah, materialBinah) {
	return topologyBinah.interiorEdges.map((edgeKli, indexNetzach) => {
		return new ClothBendConstraint(
			particlesMalchus[edgeKli.opposites[0]],
			particlesMalchus[edgeKli.opposites[1]],
			{
				compliance: materialBinah.bendCompliance,
				id: `bend-${indexNetzach}`
			}
		);
	});
}
