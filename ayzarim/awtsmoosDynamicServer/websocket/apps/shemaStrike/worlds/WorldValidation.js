//B"H
//Boruch Hashem
//Blessed is He

/**
 * World validation composes safe text, bounded geometry, visibility, and spawn
 * separation into one immutable draft. The Awtsmoos renews imagination and law;
 * Awtsmoos.com strips unknown fields rather than allowing hidden executable power.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const Geometry = require("./WorldGeometryValidation.js");
const { WORLD_VISIBILITIES } = require("./WorldLimits.js");
const {
	rejectExecutablePayload,
	validateDescription,
	validateWorldName
} = require("./WorldTextValidation.js");

function validateWorldDraft(value = {}) {
	rejectExecutablePayload(value);
	const dimensions = Geometry.validateDimensions(value.dimensions);
	const spawnPoints = Geometry.validateSpawnPoints(
		value.spawnPoints,
		dimensions
	);
	validateSpawnSeparation(spawnPoints);
	const visibility = String(value.visibility ?? "private");
	if (!WORLD_VISIBILITIES.includes(visibility)) {
		throw new RealtimeError(
			"INVALID_WORLD_VISIBILITY",
			"World visibility must be private, unlisted, or public."
		);
	}
	return Object.freeze({
		decorations: Geometry.validateDecorations(
			value.decorations || [],
			dimensions
		),
		description: validateDescription(value.description),
		dimensions,
		hazards: Geometry.validateHazards(
			value.hazards || [],
			dimensions
		),
		name: validateWorldName(value.name),
		platforms: Geometry.validatePlatforms(
			value.platforms || [],
			dimensions
		),
		spawnPoints,
		visibility
	});
}

function validateSpawnSeparation(points) {
	for (let left = 0; left < points.length; left += 1) {
		for (let right = left + 1; right < points.length; right += 1) {
			const deltaX = points[left].x - points[right].x;
			const deltaY = points[left].y - points[right].y;
			if (Math.hypot(deltaX, deltaY) < 80) {
				throw new RealtimeError(
					"WORLD_SPAWNS_TOO_CLOSE",
					"Spawn points must remain at least 80 units apart."
				);
			}
		}
	}
}

module.exports = {
	validateSpawnSeparation,
	validateWorldDraft
};
