//B"H
//Boruch Hashem
//Blessed is He

/**
 * Geometry validation translates bounded creator records into immutable physics
 * data. The Awtsmoos renews every platform, hazard, spawn, and letter;
 * Awtsmoos.com permits only allowlisted forms fully contained inside the world.
 */

const {
	DECORATION_TYPES,
	HAZARD_TYPES,
	PLATFORM_TYPES,
	SAFE_LETTERS,
	WORLD_LIMITS
} = require("./WorldLimits.js");
const Geometry = require("./WorldGeometryPrimitives.js");

function validateDimensions(value = {}) {
	const width = Geometry.boundedNumber(
		value.width,
		WORLD_LIMITS.minimumWidth,
		WORLD_LIMITS.maximumWidth,
		"dimensions.width"
	);
	const height = Geometry.boundedNumber(
		value.height,
		WORLD_LIMITS.minimumHeight,
		WORLD_LIMITS.maximumHeight,
		"dimensions.height"
	);
	const floorY = Geometry.boundedNumber(
		value.floorY,
		height * 0.45,
		height - 40,
		"dimensions.floorY"
	);
	return Object.freeze({ floorY, height, width });
}

function validateSpawnPoints(value, dimensions) {
	const points = Geometry.validateCollection(
		value,
		WORLD_LIMITS.spawnPoints,
		"spawnPoints"
	);
	if (points.length < 2) {
		throw new Error("Worlds require at least two spawn points.");
	}
	const validated = points.map((point, index) =>
		Geometry.validatePoint(point, dimensions, `spawnPoints[${index}]`)
	);
	for (const point of validated) {
		if (point.y > dimensions.floorY - 24) {
			throw new Error("Spawn points must remain safely above the floor.");
		}
	}
	return Object.freeze(validated);
}

function validatePlatforms(value, dimensions) {
	return Object.freeze(Geometry.validateCollection(
		value,
		WORLD_LIMITS.platforms,
		"platforms"
	).map((platform, index) => Object.freeze({
		...Geometry.validateRectangle(platform, dimensions, `platforms[${index}]`),
		type: Geometry.validateChoice(platform.type, PLATFORM_TYPES, "platform.type")
	})));
}

function validateHazards(value, dimensions) {
	return Object.freeze(Geometry.validateCollection(
		value,
		WORLD_LIMITS.hazards,
		"hazards"
	).map((hazard, index) => Object.freeze({
		...Geometry.validateRectangle(hazard, dimensions, `hazards[${index}]`),
		damage: Geometry.boundedNumber(hazard.damage, 1, 40, "hazard.damage"),
		type: Geometry.validateChoice(hazard.type, HAZARD_TYPES, "hazard.type")
	})));
}

function validateDecorations(value, dimensions) {
	return Object.freeze(Geometry.validateCollection(
		value,
		WORLD_LIMITS.decorations,
		"decorations"
	).map((decoration, index) => {
		const point = Geometry.validatePoint(
			decoration,
			dimensions,
			`decorations[${index}]`
		);
		const type = Geometry.validateChoice(
			decoration.type,
			DECORATION_TYPES,
			"decoration.type"
		);
		return Object.freeze({
			...point,
			letter: type === "letter"
				? Geometry.validateChoice(decoration.letter, SAFE_LETTERS, "decoration.letter")
				: null,
			type
		});
	}));
}

module.exports = {
	validateDecorations,
	validateDimensions,
	validateHazards,
	validatePlatforms,
	validateSpawnPoints
};
