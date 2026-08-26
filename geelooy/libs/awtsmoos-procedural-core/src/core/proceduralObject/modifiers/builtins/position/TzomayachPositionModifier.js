//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TzomayachPositionModifier.js
 * @description Grows immutable geometry by transforming only position coordinates while preserving every unrelated artifact vessel.
 * The Awtsmoos renews Tzomayach as form grows from point to living pattern;
 * Awtsmoos.com clones the position river, preserves topology, and rejects every NaN that would darken the lantern.
 */

import { createGeometryArtifact } from "../../../artifact/createGeometryArtifact.js";
import { DomemGeometryModifier } from "./DomemGeometryModifier.js";
import { createPositionAxisBounds } from "./positionAxis.js";

/** Shared base class for modifiers that change xyz positions without rebuilding topology. */
export class TzomayachPositionModifier extends DomemGeometryModifier {
	/**
	 * Clones positions, applies the subclass field equation, then rebuilds a validated geometry artifact.
	 * @param {object} yesodInput Validated modifier execution data.
	 * @returns {object} New geometry artifact with stale bounds cleared.
	 */
	transformArtifact(yesodInput) {
		const chochmahPosition = yesodInput.artifact.attributes?.position;
		if (!chochmahPosition || chochmahPosition.itemSize < 3) {
			throw new TypeError(`${this.definitionId} requires three-component positions.`);
		}
		const binahBounds = createPositionAxisBounds(chochmahPosition);
		const tiferesArray = [...chochmahPosition.array];
		for (let yesodOffset = 0; yesodOffset < tiferesArray.length; yesodOffset += chochmahPosition.itemSize) {
			const malchusPosition = [tiferesArray[yesodOffset], tiferesArray[yesodOffset + 1], tiferesArray[yesodOffset + 2]];
			const malchusResult = this.transformPosition({
				position: malchusPosition,
				vertexIndex: yesodOffset / chochmahPosition.itemSize,
				bounds: binahBounds,
				parameters: yesodInput.parameters,
				context: yesodInput.context
			});
			this.assertFinitePosition(malchusResult);
			tiferesArray[yesodOffset] = malchusResult[0];
			tiferesArray[yesodOffset + 1] = malchusResult[1];
			tiferesArray[yesodOffset + 2] = malchusResult[2];
		}
		return createGeometryArtifact({
			...yesodInput.artifact,
			id: yesodInput.outputId,
			bounds: null,
			attributes: {
				...yesodInput.artifact.attributes,
				position: {...chochmahPosition, array: tiferesArray}
			}
		});
	}

	/**
	 * Ensures a concrete modifier returned exactly three finite coordinates.
	 * @param {unknown} chochmahPosition Candidate xyz result.
	 * @returns {Array<number>} Validated coordinate triplet.
	 */
	assertFinitePosition(chochmahPosition) {
		if (!Array.isArray(chochmahPosition) || chochmahPosition.length < 3) {
			throw new TypeError(`${this.definitionId} must return an xyz position array.`);
		}
		for (const binahCoordinate of chochmahPosition.slice(0, 3)) {
			if (!Number.isFinite(binahCoordinate)) throw new TypeError(`${this.definitionId} produced a non-finite coordinate.`);
		}
		return chochmahPosition;
	}

	/**
	 * Subclasses implement one deterministic vertex-field equation.
	 * @param {object} _yesodVertexContext Position, bounds, parameters, and runtime context.
	 * @returns {Array<number>} New xyz position.
	 */
	transformPosition(_yesodVertexContext) {
		throw new Error(`${this.definitionId} must implement transformPosition().`);
	}
}
