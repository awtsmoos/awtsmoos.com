// B"H
import { createStairSolidDefinition } from './StairVisualGeometry.js';

/** Returns one visible, solid, octree-ready stair definition. */
export function createStairDefinitions(layout, spec, material) {
	return [createStairSolidDefinition(layout, spec, material)];
}

export function createStairDefinition(layout, spec, material) {
	return createStairSolidDefinition(layout, spec, material);
}
