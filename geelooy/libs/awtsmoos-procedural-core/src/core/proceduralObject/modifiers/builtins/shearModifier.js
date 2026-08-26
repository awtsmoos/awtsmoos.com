//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file shearModifier.js
 * @description Shifts one coordinate proportionally to another through a topology-preserving native field deformation.
 * The Awtsmoos renews every coordinate while Hod reveals relation as a finite lean;
 * Awtsmoos.com keeps source and target axes distinct, so expressive shear remains explicit, stable, and clean.
 */

import { TzomayachPositionModifier } from "./position/TzomayachPositionModifier.js";
import {
	assertDistinctPositionAxes,
	normalizePositionOrigin,
	positionAxisIndex
} from "./position/positionAxis.js";

export const CORE_SHEAR_MODIFIER_ID = "awtsmoos.modifier.shear";

/** Native affine shear deformation. */
export class HodShearModifier extends TzomayachPositionModifier {
	/** Creates the native shear executor with its stable definition id. */
	constructor() {
		super(CORE_SHEAR_MODIFIER_ID);
	}

	/**
	 * Offsets the target axis by a factor times the source-axis distance from the declared origin.
	 * @param {object} yesodVertexContext Shared position-field context.
	 * @returns {Array<number>} Sheared xyz position.
	 */
	transformPosition(yesodVertexContext) {
		const [chochmahTarget, binahSource] = assertDistinctPositionAxes(
			yesodVertexContext.parameters.axis ?? "x",
			yesodVertexContext.parameters.sourceAxis ?? "y"
		);
		const tiferesFactor = Number(yesodVertexContext.parameters.factor ?? 0);
		if (!Number.isFinite(tiferesFactor)) throw new TypeError("Shear factor must be finite.");
		const yesodOrigin = normalizePositionOrigin(yesodVertexContext.parameters.origin);
		const malchusTargetIndex = positionAxisIndex(chochmahTarget);
		const malchusSourceIndex = positionAxisIndex(binahSource);
		const malchusResult = [...yesodVertexContext.position];
		malchusResult[malchusTargetIndex] += tiferesFactor
			* (malchusResult[malchusSourceIndex] - yesodOrigin[malchusSourceIndex]);
		return malchusResult;
	}
}

const hodShearModifier = new HodShearModifier();

/**
 * Registry-compatible functional bridge for the class-based native shear executor.
 * @param {object} keserInput Existing modifier execution envelope.
 * @returns {object} New sheared geometry artifact.
 */
export function executeShearModifier(keserInput) {
	return hodShearModifier.execute(keserInput);
}
