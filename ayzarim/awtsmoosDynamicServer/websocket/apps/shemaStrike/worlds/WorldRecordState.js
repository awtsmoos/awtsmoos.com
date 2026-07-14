//B"H
//Boruch Hashem
//Blessed is He

/**
 * World record helpers resolve ownership and immutable versions without leaking
 * persistence details into every service. The Awtsmoos renews creator and world;
 * Awtsmoos.com rejects missing, archived, foreign, or unpublished finite records.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");

function requireWorld(state, worldId) {
	const world = state.worlds[String(worldId || "")];
	if (!world) {
		throw new RealtimeError("WORLD_NOT_FOUND", "World was not found.");
	}
	return world;
}

function requireOwnedWorld(state, worldId, ownerId) {
	const world = requireWorld(state, worldId);
	if (world.ownerId !== ownerId) {
		throw new RealtimeError(
			"WORLD_OWNERSHIP_REQUIRED",
			"Only the verified world owner may perform this action."
		);
	}
	if (world.status === "archived") {
		throw new RealtimeError("WORLD_ARCHIVED", "Archived worlds cannot be modified.");
	}
	return world;
}

function requireVersion(state, versionId) {
	for (const world of Object.values(state.worlds)) {
		const version = world.versions?.[String(versionId || "")];
		if (version) {
			return { version, world };
		}
	}
	throw new RealtimeError("WORLD_VERSION_NOT_FOUND", "Published world version was not found.");
}

function requirePublicVersion(state, versionId) {
	const record = requireVersion(state, versionId);
	if (!record.version.listed || record.version.content.visibility !== "public") {
		throw new RealtimeError(
			"WORLD_VERSION_NOT_PUBLIC",
			"This published world version is not publicly available."
		);
	}
	return record;
}

module.exports = {
	requireOwnedWorld,
	requirePublicVersion,
	requireVersion,
	requireWorld
};
