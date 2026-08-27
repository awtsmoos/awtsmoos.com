//B"H
//Boruch Hashem
//Blessed is He

/**
 * Projection reveals only the world fields appropriate to owner, discoverer, or
 * arena runtime. The Awtsmoos renews hidden draft and public version;
 * Awtsmoos.com withholds reports, mutable records, and persistence internals.
 */

function ownerWorldProjection(world) {
	return {
		createdAt: world.createdAt,
		draft: clone(world.draft),
		id: world.id,
		latestVersionId: world.latestVersionId,
		ownerId: world.ownerId,
		status: world.status,
		updatedAt: world.updatedAt,
		versions: Object.values(world.versions || {})
			.map(ownerVersionProjection)
	};
}

function ownerVersionProjection(version) {
	return {
		contentHash: version.contentHash,
		id: version.id,
		listed: version.listed,
		publishedAt: version.publishedAt,
		versionNumber: version.versionNumber,
		worldId: version.worldId
	};
}

function publicVersionProjection(world, version) {
	return {
		contentHash: version.contentHash,
		description: version.content.description,
		dimensions: clone(version.content.dimensions),
		id: version.id,
		name: version.content.name,
		ownerId: world.ownerId,
		publishedAt: version.publishedAt,
		versionNumber: version.versionNumber,
		visibility: version.content.visibility,
		worldId: world.id
	};
}

function runtimeWorldProjection(version) {
	return {
		contentHash: version.contentHash,
		decorations: clone(version.content.decorations),
		dimensions: clone(version.content.dimensions),
		hazards: clone(version.content.hazards),
		name: version.content.name,
		platforms: clone(version.content.platforms),
		spawnPoints: clone(version.content.spawnPoints),
		versionId: version.id,
		worldId: version.worldId
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	ownerWorldProjection,
	publicVersionProjection,
	runtimeWorldProjection
};
