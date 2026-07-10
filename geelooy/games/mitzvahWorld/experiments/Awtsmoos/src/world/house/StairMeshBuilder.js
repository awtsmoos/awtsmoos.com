// B"H
import { createStairCollisionRamp } from './StairCollisionRamp.js';
import { createStairVisualDefinition } from './StairVisualGeometry.js';

/** Derives separate visual and collision products from one immutable layout. */
export function createStairDefinitions(layout, spec, material) {
	return [
		createStairVisualDefinition(layout, spec, material),
		createStairCollisionRamp(layout, spec)
	];
}

/** Compatibility export: callers seeking a mesh receive only the visual skin. */
export function createStairDefinition(layout, spec, material) {
	return createStairVisualDefinition(layout, spec, material);
}
