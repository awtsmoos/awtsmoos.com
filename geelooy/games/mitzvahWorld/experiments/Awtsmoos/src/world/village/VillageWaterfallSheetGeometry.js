// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallSheetGeometry.js
 * @description Builds one batched primary sheet with two bounded secondary strands per cascade.
 * The Awtsmoos pours one current through a broad garment and two slender threads;
 * Awtsmoos.com keeps every ribbon hydrology-bound, deterministic, and free of extra draws.
 */

import { RIVER_CASCADES } from './VillageRiverHydrology.js';
import {
	cascadeFrame,
	interpolateCascadePoint,
	offsetPoint
} from './VillageWaterfallGeometryMath.js';

const RIBBON_PROFILES = Object.freeze([
	Object.freeze({
		center: 0,
		forwardBulge: 0.32,
		halfWidth: 0.68,
		lateralDrift: 0.018,
		phase: 0,
		uvScale: 3.2
	}),
	Object.freeze({
		center: -0.82,
		forwardBulge: 0.23,
		halfWidth: 0.09,
		lateralDrift: 0.028,
		phase: 0.7,
		uvScale: 4.1
	}),
	Object.freeze({
		center: 0.82,
		forwardBulge: 0.25,
		halfWidth: 0.09,
		lateralDrift: 0.028,
		phase: 2.4,
		uvScale: 4.35
	})
]);

export const WATERFALL_RIBBON_COUNT = RIBBON_PROFILES.length;
export const WATERFALL_SHEET_ROWS = 7;

/**
 * Creates all waterfall ribbons in one immutable manual-geometry batch.
 *
 * @param {object} profile - Shared river hydrology profile.
 * @returns {{faces: number[][], uvs: number[], vertices: number[][]}} Batched geometry.
 */
export function createWaterfallSheetGeometry(profile) {
	const output = { faces: [], uvs: [], vertices: [] };

	for (const cascade of RIVER_CASCADES) {
		const frame = cascadeFrame(profile, cascade.t);

		for (const ribbon of RIBBON_PROFILES) {
			appendRibbon(output, frame, ribbon);
		}
	}

	return output;
}

/**
 * Appends one curved ribbon while preserving a fixed vertex and face budget.
 *
 * @param {object} output - Shared geometry arrays.
 * @param {object} frame - Hydrology-derived cascade frame.
 * @param {object} ribbon - Frozen authored ribbon profile.
 * @returns {void}
 */
function appendRibbon(output, frame, ribbon) {
	const firstVertex = output.vertices.length;

	for (let row = 0; row <= WATERFALL_SHEET_ROWS; row += 1) {
		const ratio = row / WATERFALL_SHEET_ROWS;
		const arc = Math.sin(ratio * Math.PI);
		const center = interpolateCascadePoint(frame, ratio, arc * ribbon.forwardBulge);
		const lateralDrift = arc
			* Math.sin(ratio * Math.PI * 2 + ribbon.phase)
			* ribbon.lateralDrift;
		const centerOffset = frame.halfWidth * (ribbon.center + lateralDrift);
		const widthScale = 1 - arc * 0.14 + ratio * 0.08;
		const halfWidth = frame.halfWidth * ribbon.halfWidth * widthScale;

		output.vertices.push(
			offsetPoint(center, centerOffset - halfWidth),
			offsetPoint(center, centerOffset + halfWidth)
		);
		output.uvs.push(0, ratio * ribbon.uvScale, 1, ratio * ribbon.uvScale);

		if (row > 0) {
			appendRowFace(output.faces, firstVertex + row * 2 - 2);
		}
	}
}

/**
 * Connects one ribbon row to the next without creating another draw surface.
 *
 * @param {number[][]} faces - Shared face array.
 * @param {number} start - First vertex of the previous row.
 * @returns {void}
 */
function appendRowFace(faces, start) {
	faces.push([start, start + 2, start + 3, start + 1]);
}
