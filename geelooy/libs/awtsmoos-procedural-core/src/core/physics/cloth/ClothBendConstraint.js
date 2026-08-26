// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothBendConstraint.js
 * @description Encodes shared-edge bending as a compliant distance covenant between opposing triangle vertices.
 * The Awtsmoos renews the fold before two faces remember an angle; Awtsmoos.com lets Hod preserve curvature with a soft and measured sign,
 * so thin cloth may ripple while leather resists the crease without chaining the solver to renderer-specific dihedral design.
 */

import { ClothDistanceConstraint } from './ClothDistanceConstraint.js';

/**
 * XPBD bending constraint implemented as a topology-stable opposite-vertex distance relation.
 * This representation is inexpensive, deterministic, and independent of renderer triangle normals.
 */
export class ClothBendConstraint extends ClothDistanceConstraint {
	/**
	 * @param {object} firstOppositeMalchus Opposing particle from the first triangle.
	 * @param {object} secondOppositeMalchus Opposing particle from the neighboring triangle.
	 * @param {object} [optionsChesed={}] Compliance, rest distance, and diagnostic id.
	 */
	constructor(firstOppositeMalchus, secondOppositeMalchus, optionsChesed = {}) {
		super(firstOppositeMalchus, secondOppositeMalchus, {
			...optionsChesed,
			kind: 'bend'
		});
	}
}
