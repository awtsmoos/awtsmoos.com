// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallSheetGeometry.js
 * @description Builds one subdivided batch of hydrology-bound descending water sheets.
 * The Awtsmoos pours without becoming a cardboard plane; Awtsmoos.com bends each finite
 * sheet downstream while every top, impact, width, and UV remains measured and shared.
 */

import { RIVER_CASCADES } from './VillageRiverHydrology.js';
import {
	cascadeFrame,
	interpolateCascadePoint,
	offsetPoint
} from './VillageWaterfallGeometryMath.js';

export const WATERFALL_SHEET_ROWS = 7;

export function createWaterfallSheetGeometry(profile) {
	const output = { faces: [], uvs: [], vertices: [] };
	for (const cascade of RIVER_CASCADES) {
		appendSheet(output, cascadeFrame(profile, cascade.t));
	}
	return output;
}

function appendSheet(output, frame) {
	const firstVertex = output.vertices.length;
	for (let row = 0; row <= WATERFALL_SHEET_ROWS; row += 1) {
		const ratio = row / WATERFALL_SHEET_ROWS;
		const bulge = Math.sin(ratio * Math.PI) * 0.32;
		const center = interpolateCascadePoint(frame, ratio, bulge);
		const widthScale = 1 - Math.sin(ratio * Math.PI) * 0.14 + ratio * 0.08;
		const width = frame.halfWidth * widthScale;
		output.vertices.push(
			offsetPoint(center, -width),
			offsetPoint(center, width)
		);
		output.uvs.push(0, ratio * 3.2, 1, ratio * 3.2);
		if (row > 0) appendRowFace(output.faces, firstVertex + row * 2 - 2);
	}
}

function appendRowFace(faces, start) {
	faces.push([start, start + 2, start + 3, start + 1]);
}
