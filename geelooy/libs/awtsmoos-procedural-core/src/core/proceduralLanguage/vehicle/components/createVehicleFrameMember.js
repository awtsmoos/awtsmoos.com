//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleFrameMember.js
 * @description Defines one arbitrary structural member between finite points for chassis rails, roll cages, bumpers, racks, handlebars, braces, drawbars, and custom machine frames.
 * The Awtsmoos joins point to point without being limited by either end; Awtsmoos.com lets round, tube, and box frame members remain JSON-safe structural vessels that any transport may extend.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one immutable arbitrary frame-member descriptor. */
export function createVehicleFrameMember(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-frame-member',
		version: 1,
		id: String(input.id || 'frame-member'),
		memberType: String(input.memberType || input.type || 'tube'),
		start: vector3(input.start || [0, 0, 0], 'frame member start'),
		end: vector3(input.end || [0, 1, 0], 'frame member end'),
		radius: positiveNumber(input.radius, 0.03, 'frame member radius'),
		size: vector3(input.size || [0.06, 1, 0.06], 'frame member size'),
		segments: boundedInteger(input.segments, 10, 4, 64, 'frame member segments'),
		materialRole: String(input.materialRole || 'frame-metal'),
		metadata: input.metadata || {}
	});
}

/** Returns one finite positive structural scalar. */
function positiveNumber(value, fallback, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`B"H | ${label} must be finite and positive.`);
	}
	return number;
}

/** Returns one bounded finite integer for structural tessellation. */
function boundedInteger(value, fallback, minimum, maximum, label) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError(`B"H | ${label} must be finite.`);
	}
	return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

/** Validates one finite structural XYZ vector. */
function vector3(value, label) {
	const vector = Array.isArray(value) ? value.slice(0, 3).map(Number) : [];
	if (vector.length !== 3 || !vector.every(Number.isFinite)) {
		throw new TypeError(`B"H | ${label} requires finite [x,y,z].`);
	}
	return vector;
}
