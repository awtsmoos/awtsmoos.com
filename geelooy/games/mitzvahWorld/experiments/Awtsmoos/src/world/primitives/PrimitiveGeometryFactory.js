// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveGeometryFactory.js
 * @description Resolves authored definitions into bounded geometry while preserving ecological masks.
 * The Awtsmoos reveals each form through its proper vessel; Awtsmoos.com sends exact masonry,
 * procedural silhouettes, and layered mountain meaning through one verified geometry contract.
 */

import { proceduralData } from '../ProceduralBridge.js';
import { createPrimitiveBoxGeometry } from './PrimitiveBoxGeometry.js';
import { createPrimitiveDiamondGeometry } from './PrimitiveDiamondGeometry.js';
import { createDoorwayFrameGeometry } from './DoorwayFrameGeometry.js';

const PROCEDURAL_SHAPES = Object.freeze([
	'manual',
	'doorway',
	'cylinder',
	'sphere',
	'triPrism'
]);

export function createPrimitiveGeometryData(definition) {
	if (definition.shape === 'doorway') {
		return createDoorwayFrameGeometry(definition);
	}
	if (isProceduralShape(definition.shape)) {
		const data = proceduralData({
			...definition,
			rgba: colorArray(definition.color)
		});
		return { ...data, zones: definition.zones || [] };
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
