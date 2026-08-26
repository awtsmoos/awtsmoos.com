//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bendModifier.js
 * @description Curves one longitudinal axis through a circular arc without rebuilding topology or touching unrelated attributes.
 * The Awtsmoos renews straight and curved form while Tiferes joins measure with grace;
 * Awtsmoos.com bends the centerline by explicit angle and plane, preserving a truthful mathematical trace.
 */

import { TzomayachPositionModifier } from "./position/TzomayachPositionModifier.js";
import {
	assertDistinctPositionAxes,
	normalizePositionOrigin,
	normalizePositionProgress,
	perpendicularPositionAxes,
	positionAxisIndex
} from "./position/positionAxis.js";

export const CORE_BEND_MODIFIER_ID = "awtsmoos.modifier.bend";

/** Native circular-arc bend deformation. */
export class TiferesBendModifier extends TzomayachPositionModifier {
	/** Creates the native bend executor with its stable definition id. */
	constructor() {
		super(CORE_BEND_MODIFIER_ID);
	}

	/**
	 * Maps longitudinal progress onto a circular arc and rotates the chosen bend-plane coordinate with it.
	 * @param {object} yesodVertexContext Shared position-field context.
	 * @returns {Array<number>} Bent xyz position.
	 */
	transformPosition(yesodVertexContext) {
		const chochmahAxis = yesodVertexContext.parameters.axis ?? "y";
		const defaultBendAxis = perpendicularPositionAxes(chochmahAxis)[0];
		const [binahAxis, binahBendAxis] = assertDistinctPositionAxes(
			chochmahAxis,
			yesodVertexContext.parameters.bendAxis ?? defaultBendAxis
		);
		const tiferesAngle = finiteAngle(yesodVertexContext.parameters.angle ?? 0);
		if (Math.abs(tiferesAngle) < 1e-12) return [...yesodVertexContext.position];
		const yesodBound = yesodVertexContext.bounds[binahAxis];
		if (Math.abs(yesodBound.span) < 1e-12) return [...yesodVertexContext.position];
		const malchusOrigin = normalizePositionOrigin(yesodVertexContext.parameters.origin);
		const malchusAxisIndex = positionAxisIndex(binahAxis);
		const malchusBendIndex = positionAxisIndex(binahBendAxis);
		const malchusProgress = normalizePositionProgress(
			yesodVertexContext.position[malchusAxisIndex],
			yesodBound
		);
		const malchusTheta = tiferesAngle * malchusProgress;
		const malchusRadius = yesodBound.span / tiferesAngle;
		const malchusTransverse = yesodVertexContext.position[malchusBendIndex]
			- malchusOrigin[malchusBendIndex];
		const malchusRadialDistance = malchusRadius + malchusTransverse;
		const malchusResult = [...yesodVertexContext.position];
		malchusResult[malchusAxisIndex] = yesodBound.min
			+ Math.sin(malchusTheta) * malchusRadialDistance;
		malchusResult[malchusBendIndex] = malchusOrigin[malchusBendIndex]
			- malchusRadius + Math.cos(malchusTheta) * malchusRadialDistance;
		return malchusResult;
	}
}

const tiferesBendModifier = new TiferesBendModifier();

/**
 * Registry-compatible functional bridge for the class-based native bend executor.
 * @param {object} keserInput Existing modifier execution envelope.
 * @returns {object} New bent geometry artifact.
 */
export function executeBendModifier(keserInput) {
	return tiferesBendModifier.execute(keserInput);
}

/**
 * Converts finite degree input to radians for circular-arc geometry.
 * @param {unknown} chochmahDegrees Degree value.
 * @returns {number} Finite radians.
 */
function finiteAngle(chochmahDegrees) {
	const binahDegrees = Number(chochmahDegrees);
	if (!Number.isFinite(binahDegrees)) throw new TypeError("Bend angle must be finite degrees.");
	return binahDegrees * Math.PI / 180;
}
