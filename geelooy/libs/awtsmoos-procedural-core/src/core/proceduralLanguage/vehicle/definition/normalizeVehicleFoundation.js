//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeVehicleFoundation.js
 * @description Normalizes vehicle input, dimensions, chassis, body, and propulsion separately from rich subsystem collections so the canonical constructor remains small.
 * The Awtsmoos gives foundation before wheel or window appears; Awtsmoos.com keeps measurements and structural intent in one clear vessel while richer systems may multiply without making definition law disappear.
 */

import {
	vehicleNonNegativeNumber,
	vehiclePositiveNumber
} from './vehicleDefinitionValidation.js';

/** Reads plain data, JSON text, or a fluent wrapper without creating a parallel representation. */
export function readVehicleInput(input) {
	if (typeof input === 'string') {
		return JSON.parse(input);
	}
	if (input && typeof input.toJSON === 'function') {
		return input.toJSON();
	}
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		throw new TypeError('B"H | Vehicle input must be an object or JSON string.');
	}
	return input;
}

/** Normalizes outer vehicle dimensions in canonical meters. */
export function normalizeVehicleDimensions(input = {}) {
	return {
		length: vehiclePositiveNumber(input.length, 4, 'vehicle length'),
		width: vehiclePositiveNumber(input.width, 1.8, 'vehicle width'),
		height: vehiclePositiveNumber(input.height, 1.5, 'vehicle height'),
		groundClearance: vehicleNonNegativeNumber(input.groundClearance, 0.18, 'ground clearance'),
		wheelbase: vehiclePositiveNumber(input.wheelbase, 2.5, 'wheelbase'),
		trackWidth: vehiclePositiveNumber(input.trackWidth, 1.5, 'track width')
	};
}

/** Normalizes renderer-neutral chassis intent. */
export function normalizeVehicleChassis(input = {}) {
	return {
		type: String(input.type || 'platform'),
		thickness: vehiclePositiveNumber(input.thickness, 0.16, 'chassis thickness'),
		frameRadius: vehiclePositiveNumber(input.frameRadius, 0.045, 'frame radius'),
		metadata: input.metadata || {}
	};
}

/** Normalizes optional body-envelope intent without requiring body geometry for open vehicles. */
export function normalizeVehicleBody(input = {}) {
	const type = String(input.type || 'none');
	return {
		type,
		enabled: input.enabled === undefined
			? type !== 'none'
			: Boolean(input.enabled),
		style: String(input.style || 'functional'),
		metadata: input.metadata || {}
	};
}

/** Normalizes propulsion source intent while keeping drivetrain topology in its own component. */
export function normalizeVehiclePropulsion(input = {}) {
	return {
		type: String(input.type || 'unpowered'),
		drive: String(input.drive || 'none'),
		power: vehicleNonNegativeNumber(input.power, 0, 'propulsion power'),
		metadata: input.metadata || {}
	};
}
