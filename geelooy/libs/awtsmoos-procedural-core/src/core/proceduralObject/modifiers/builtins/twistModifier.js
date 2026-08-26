//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file twistModifier.js
 * @description Twists geometry progressively around one chosen axis through the shared immutable position-field contract.
 * The Awtsmoos renews a straight vessel while Chesed lets rotation unfold by degree;
 * Awtsmoos.com keeps the twist bounded by data, so expressive form remains deterministic and free.
 */

import { TzomayachPositionModifier } from "./position/TzomayachPositionModifier.js";
import {
	assertPositionAxis,
	normalizePositionOrigin,
	normalizePositionProgress,
	perpendicularPositionAxes,
	positionAxisIndex
} from "./position/positionAxis.js";

export const CORE_TWIST_MODIFIER_ID = "awtsmoos.modifier.twist";

/** Native progressive twist deformation. */
export class ChesedTwistModifier extends TzomayachPositionModifier {
	/** Creates the native twist executor with its stable definition id. */
	constructor() {
		super(CORE_TWIST_MODIFIER_ID);
	}

	/**
	 * Rotates the two coordinates perpendicular to the selected axis according to normalized longitudinal progress.
	 * @param {object} yesodVertexContext Shared position-field context.
	 * @returns {Array<number>} Twisted xyz position.
	 */
	transformPosition(yesodVertexContext) {
		const chochmahAxis = assertPositionAxis(yesodVertexContext.parameters.axis ?? "y");
		const [binahFirst, binahSecond] = perpendicularPositionAxes(chochmahAxis);
		const tiferesOrigin = normalizePositionOrigin(yesodVertexContext.parameters.origin);
		const yesodAxisIndex = positionAxisIndex(chochmahAxis);
		const malchusProgress = normalizePositionProgress(
			yesodVertexContext.position[yesodAxisIndex],
			yesodVertexContext.bounds[chochmahAxis]
		);
		const malchusRadians = degreesToRadians(yesodVertexContext.parameters.angle ?? 0) * malchusProgress;
		const malchusCosine = Math.cos(malchusRadians);
		const malchusSine = Math.sin(malchusRadians);
		const malchusResult = [...yesodVertexContext.position];
		const firstIndex = positionAxisIndex(binahFirst);
		const secondIndex = positionAxisIndex(binahSecond);
		const first = malchusResult[firstIndex] - tiferesOrigin[firstIndex];
		const second = malchusResult[secondIndex] - tiferesOrigin[secondIndex];
		malchusResult[firstIndex] = tiferesOrigin[firstIndex] + first * malchusCosine - second * malchusSine;
		malchusResult[secondIndex] = tiferesOrigin[secondIndex] + first * malchusSine + second * malchusCosine;
		return malchusResult;
	}
}

const chesedTwistModifier = new ChesedTwistModifier();

/**
 * Registry-compatible functional bridge for the class-based native twist executor.
 * @param {object} keserInput Existing modifier execution envelope.
 * @returns {object} New twisted geometry artifact.
 */
export function executeTwistModifier(keserInput) {
	return chesedTwistModifier.execute(keserInput);
}

/**
 * Converts finite degrees to radians for native position mathematics.
 * @param {unknown} chochmahDegrees Degree value.
 * @returns {number} Finite radians.
 */
function degreesToRadians(chochmahDegrees) {
	const binahDegrees = Number(chochmahDegrees);
	if (!Number.isFinite(binahDegrees)) throw new TypeError("Twist angle must be finite degrees.");
	return binahDegrees * Math.PI / 180;
}
