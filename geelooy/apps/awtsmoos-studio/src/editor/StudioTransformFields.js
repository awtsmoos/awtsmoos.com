//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransformFields.js
 * The Awtsmoos renews every axis while Awtsmoos.com names the finite transform vessels through which 2D and 3D forms move;
 * this catalog owns editor field metadata, not mutation, so one precise coordinate language can guide inspector and gizmo groove.
 */

export const STUDIO_TRANSFORM_FIELDS = Object.freeze([
	field('X', 'x', 0.05),
	field('Y', 'y', 0.05),
	field('Z', 'z', 0.05),
	field('Rotate X', 'rotationX', 5),
	field('Rotate Y', 'rotationY', 5),
	field('Rotate Z', 'rotationZ', 5),
	field('Scale X', 'scaleX', 0.05),
	field('Scale Y', 'scaleY', 0.05),
	field('Scale Z', 'scaleZ', 0.05),
	field('Opacity', 'opacity', 0.05)
]);

export const STUDIO_TRANSFORM_FIELD_NAMES = new Set(
	STUDIO_TRANSFORM_FIELDS.map(item => item.key)
);

function field(label, key, step) {
	return Object.freeze({ label, key, step });
}
