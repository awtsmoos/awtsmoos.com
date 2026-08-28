//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleBodySection.js
 * @description Defines one renderer-neutral body section using box, panel, tube, or cylinder geometry so custom shells, bumpers, mirrors, fairings, roofs, walls, steps, and cargo bodies may be authored directly.
 * The Awtsmoos clothes form without becoming the garment while Awtsmoos.com lets every section carry its own primitive intent, material role, semantic identity, and finite geometry covenant.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable arbitrary body-section descriptor. */
export function createVehicleBodySection(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-body-section',
		version: 1,
		id: String(input.id || 'body-section'),
		sectionType: String(input.sectionType || input.type || 'box'),
		geometry: normalizeSectionGeometry(input.geometry || input),
		materialRole: String(input.materialRole || 'body-paint'),
		metadata: input.metadata || {}
	});
}

/** Normalizes the common geometry vocabulary consumed by section-specific mesh manifestation. */
function normalizeSectionGeometry(input) {
	return {
		center: vector3(input.center || input.position || [0, 0, 0], 'body section center'),
		position: vector3(input.position || input.center || [0, 0, 0], 'body section position'),
		start: vector3(input.start || [0, 0, 0], 'body section start'),
		end: vector3(input.end || [0, 1, 0], 'body section end'),
		size: vector3(input.size || [1, 1, 1], 'body section size'),
		normal: vector3(input.normal || [0, 1, 0], 'body section normal'),
		radius: positiveNumber(input.radius, 0.05, 'body section radius'),
		majorRadius: positiveNumber(input.majorRadius, 0.3, 'body section major radius'),
		tubeRadius: positiveNumber(input.tubeRadius, 0.05, 'body section tube radius'),
		segments: boundedInteger(input.segments, 12, 3, 96, 'body section segments')
	};
}

/** Returns one finite positive body-section scalar. */
function positiveNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one bounded finite body-section segment count. */
function boundedInteger(value, fallback, minimum, maximum, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

/** Validates one finite body-section XYZ vector. */
function vector3(value, label) {
	const vector = Array.isArray(value) ? value.slice(0, 3).map(Number) : [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}
