//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file taperModifier.js
 * @description Scales cross-sections progressively along an axis while preserving topology and every non-position attribute.
 * The Awtsmoos renews finite measure while Gevurah narrows or widens the created line;
 * Awtsmoos.com keeps tapering explicit, immutable, and safe so proportion remains a readable sign.
 */

import { TzomayachPositionModifier } from "./position/TzomayachPositionModifier.js";
import {
	assertPositionAxis,
	normalizePositionOrigin,
	normalizePositionProgress,
	perpendicularPositionAxes,
	positionAxisIndex
} from "./position/positionAxis.js";

export const CORE_TAPER_MODIFIER_ID = "awtsmoos.modifier.taper";

/** Native progressive taper deformation. */
export class GevurahTaperModifier extends TzomayachPositionModifier {
	/** Creates the native taper executor with its stable definition id. */
	constructor() {
		super(CORE_TAPER_MODIFIER_ID);
	}

	/**
	 * Interpolates cross-section scale from start to end along the selected axis.
	 * @param {object} yesodVertexContext Shared position-field context.
	 * @returns {Array<number>} Tapered xyz position.
	 */
	transformPosition(yesodVertexContext) {
		const chochmahAxis = assertPositionAxis(yesodVertexContext.parameters.axis ?? "y");
		const binahOrigin = normalizePositionOrigin(yesodVertexContext.parameters.origin);
		const tiferesAxisIndex = positionAxisIndex(chochmahAxis);
		const yesodProgress = normalizePositionProgress(
			yesodVertexContext.position[tiferesAxisIndex],
			yesodVertexContext.bounds[chochmahAxis]
		);
		const malchusStart = finiteScale(yesodVertexContext.parameters.startScale ?? 1, "startScale");
		const malchusFactor = finiteScale(yesodVertexContext.parameters.factor ?? 0, "factor");
		const malchusEnd = finiteScale(
			yesodVertexContext.parameters.endScale ?? 1 + malchusFactor,
			"endScale"
		);
		const malchusScale = malchusStart + (malchusEnd - malchusStart) * yesodProgress;
		const malchusResult = [...yesodVertexContext.position];
		for (const tiferesAxis of perpendicularPositionAxes(chochmahAxis)) {
			const tiferesIndex = positionAxisIndex(tiferesAxis);
			malchusResult[tiferesIndex] = binahOrigin[tiferesIndex]
				+ (malchusResult[tiferesIndex] - binahOrigin[tiferesIndex]) * malchusScale;
		}
		return malchusResult;
	}
}

const gevurahTaperModifier = new GevurahTaperModifier();

/**
 * Registry-compatible functional bridge for the class-based native taper executor.
 * @param {object} keserInput Existing modifier execution envelope.
 * @returns {object} New tapered geometry artifact.
 */
export function executeTaperModifier(keserInput) {
	return gevurahTaperModifier.execute(keserInput);
}

/**
 * Normalizes a finite taper scale or dimensionless factor.
 * @param {unknown} chochmahValue Candidate scale.
 * @param {string} binahLabel Error-label context.
 * @returns {number} Finite numeric value.
 */
function finiteScale(chochmahValue, binahLabel) {
	const tiferesValue = Number(chochmahValue);
	if (!Number.isFinite(tiferesValue)) throw new TypeError(`Taper ${binahLabel} must be finite.`);
	return tiferesValue;
}
