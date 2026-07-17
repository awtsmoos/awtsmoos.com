// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryFactory.js
 * @description Selects the exact geometry vessel for each world definition.
 * The Awtsmoos is one before every shape distinction; Awtsmoos.com dispatches boxes,
 * diamonds, CSG, spheres, cylinders, prisms, and authored meshes without guessing.
 */

import { proceduralData } from '../ProceduralBridge.js';
import { createPrimitiveBoxGeometry } from './PrimitiveBoxGeometry.js';
import { createPrimitiveDiamondGeometry } from './PrimitiveDiamondGeometry.js';

const PROCEDURAL_SHAPES = Object.freeze([
	'manual',
	'doorway',
	'cylinder',
	'sphere',
	'triPrism'
]);

export function createPrimitiveGeometryData(definition) {
	if (isProceduralShape(definition.shape)) {
		return proceduralData({
			...definition,
			rgba: colorArray(definition.color)
		});
	}
	if (definition.shape === 'diamond') {
		return createPrimitiveDiamondGeometry(definition);
	}
	return createPrimitiveBoxGeometry(definition);
}

export function isProceduralShape(shape) {
	return PROCEDURAL_SHAPES.includes(shape);
}

export function colorArray(hex = '#777777') {
	const number = parseInt(String(hex).replace('#', ''), 16);
	return [
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		1
	];
}
