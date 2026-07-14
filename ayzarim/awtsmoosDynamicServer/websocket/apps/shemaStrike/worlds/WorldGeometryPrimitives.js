//B"H
//Boruch Hashem
//Blessed is He

/**
 * Geometry primitives measure every coordinate before it enters shared physics.
 * The Awtsmoos renews point, line, and boundary; Awtsmoos.com accepts only finite
 * positive vessels that remain entirely inside the authored world dimensions.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");

function boundedNumber(value, minimum, maximum, field) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < minimum || number > maximum) {
		throw new RealtimeError(
			"INVALID_WORLD_GEOMETRY",
			`${field} must be finite and between ${minimum} and ${maximum}.`
		);
	}
	return Math.round(number * 100) / 100;
}

function validatePoint(value, dimensions, field) {
	return Object.freeze({
		x: boundedNumber(value?.x, 0, dimensions.width, `${field}.x`),
		y: boundedNumber(value?.y, 0, dimensions.height, `${field}.y`)
	});
}

function validateRectangle(value, dimensions, field) {
	const x = boundedNumber(value?.x, 0, dimensions.width, `${field}.x`);
	const y = boundedNumber(value?.y, 0, dimensions.height, `${field}.y`);
	const width = boundedNumber(value?.width, 8, dimensions.width, `${field}.width`);
	const height = boundedNumber(value?.height, 8, dimensions.height, `${field}.height`);
	if (x + width > dimensions.width || y + height > dimensions.height) {
		throw new RealtimeError(
			"WORLD_GEOMETRY_OUT_OF_BOUNDS",
			`${field} extends beyond the world dimensions.`
		);
	}
	return {
		height,
		width,
		x,
		y
	};
}

function validateCollection(value, maximum, field) {
	if (!Array.isArray(value) || value.length > maximum) {
		throw new RealtimeError(
			"INVALID_WORLD_COLLECTION",
			`${field} must be an array containing at most ${maximum} items.`
		);
	}
	return value;
}

function validateChoice(value, choices, field) {
	if (!choices.includes(value)) {
		throw new RealtimeError(
			"INVALID_WORLD_CHOICE",
			`${field} contains an unsupported value.`
		);
	}
	return value;
}

module.exports = {
	boundedNumber,
	validateChoice,
	validateCollection,
	validatePoint,
	validateRectangle
};
