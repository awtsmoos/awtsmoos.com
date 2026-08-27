//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendVehiclePanelPrism.js
 * @description Appends an arbitrarily oriented thin rectangular prism for doors, windows, windshields, hatches, roofs, body panels, and other finite vehicle surfaces.
 * The Awtsmoos is beyond plane and thickness while Awtsmoos.com lets one semantic normal receive a stable local frame; glass and painted panels may become true polygons without binding their form to renderer name.
 */

import {
	addVehicleVector,
	scaleVehicleVector,
	vehiclePerpendicularFrame
} from './vehicleGeometryMath.js';

/**
 * Appends one oriented panel prism centered at `position` using width/thickness/height from `size`.
 * @param {object} accumulator Shared vehicle mesh accumulator.
 * @param {object} input Position, size, normal, id, and material role.
 * @returns {Array<number>} Eight appended vertex indices.
 */
export function appendVehiclePanelPrism(accumulator, input = {}) {
	const position = input.position || [0, 0, 0];
	const size = input.size || [1, 0.05, 1];
	const frame = vehiclePerpendicularFrame(input.normal || [1, 0, 0]);
	const halfWidth = Number(size[0]) / 2;
	const halfThickness = Math.max(Number(size[1]) / 2, 0.001);
	const halfHeight = Number(size[2]) / 2;
	const vertices = panelCorners(
		accumulator,
		position,
		frame,
		halfWidth,
		halfThickness,
		halfHeight
	);
	appendPanelFaces(accumulator, vertices, input);
	return vertices;
}

/** Creates the eight local-frame corners used by a thin oriented box. */
function panelCorners(accumulator, position, frame, halfWidth, halfThickness, halfHeight) {
	const vertices = [];
	for (const normalSign of [-1, 1]) {
		for (const heightSign of [-1, 1]) {
			for (const widthSign of [-1, 1]) {
				let point = addVehicleVector(
					position,
					scaleVehicleVector(frame.direction, normalSign * halfThickness)
				);
				point = addVehicleVector(
					point,
					scaleVehicleVector(frame.first, widthSign * halfWidth)
				);
				point = addVehicleVector(
					point,
					scaleVehicleVector(frame.second, heightSign * halfHeight)
				);
				vertices.push(accumulator.vertex(point));
			}
		}
	}
	return vertices;
}

/** Appends six deterministic quad faces over the panel's eight generated corners. */
function appendPanelFaces(accumulator, vertices, input) {
	const faces = [
		[0, 1, 3, 2],
		[4, 6, 7, 5],
		[0, 4, 5, 1],
		[2, 3, 7, 6],
		[0, 2, 6, 4],
		[1, 5, 7, 3]
	];
	faces.forEach((face, index) => {
		accumulator.face(face.map(vertex => vertices[vertex]), {
			id: `${input.id || 'panel'}:face:${index}`,
			materialRole: input.materialRole
		});
	});
}
