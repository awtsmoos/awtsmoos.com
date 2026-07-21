// B"H
// Boruch Hashem
// Blessed is He
/** Rasterization samples a continuous form into a deterministic finite lattice. */

import { createScalarGrid3d, gridPoint3d } from "./grid3d.js";
import { sampleSignedDistanceField } from "./sampleSignedDistanceField.js";

export function rasterizeSignedDistanceField(field, gridInput = {}) {
	const template = createScalarGrid3d(gridInput);
	const values = [];
	for (let z = 0; z < template.depth; z += 1) {
		for (let y = 0; y < template.height; y += 1) {
			for (let x = 0; x < template.width; x += 1) {
				values.push(sampleSignedDistanceField(field, gridPoint3d(template, x, y, z)));
			}
		}
	}
	return createScalarGrid3d({ ...template, values });
}
