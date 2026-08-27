//B"H
//Boruch Hashem
//Blessed is He

/**
 * Publication freezes one validated draft into an immutable numbered version.
 * The Awtsmoos renews draft and publication without confusing them; Awtsmoos.com
 * records a content hash and lets unlisting alter discovery, never version content.
 */

const { randomUUID } = require("node:crypto");
const { hashWorldContent } = require("./WorldHash.js");
const State = require("./WorldRecordState.js");
const {
	ownerWorldProjection,
	publicVersionProjection,
	runtimeWorldProjection
} = require("./WorldProjection.js");
const { validateWorldDraft } = require("./WorldValidation.js");

class WorldPublicationService {
	constructor(repository, now = Date.now) {
		this.repository = repository;
		this.now = now;
	}

	publish(ownerId, worldId) {
		return this.repository.mutate((state) => {
			const world = State.requireOwnedWorld(state, worldId, ownerId);
			const content = validateWorldDraft(world.draft);
			const versionNumber = Object.keys(world.versions).length + 1;
			const version = {
				content,
				contentHash: hashWorldContent(content),
				id: randomUUID(),
				listed: content.visibility !== "private",
				publishedAt: this.now(),
				reports: [],
				versionNumber,
				worldId: world.id
			};
			world.latestVersionId = version.id;
			world.status = "active";
			world.updatedAt = this.now();
			world.versions[version.id] = version;
			return {
				version: publicVersionProjection(world, version),
				world: ownerWorldProjection(world)
			};
		});
	}

	unpublish(ownerId, versionId) {
		return this.repository.mutate((state) => {
			const { version, world } = State.requireVersion(state, versionId);
			State.requireOwnedWorld(state, world.id, ownerId);
			version.listed = false;
			world.updatedAt = this.now();
			return ownerWorldProjection(world);
		});
	}

	getPublic(versionId) {
		return this.repository.read((state) => {
			const { version, world } = State.requirePublicVersion(state, versionId);
			return publicVersionProjection(world, version);
		});
	}

	resolveRuntime(versionId) {
		if (!versionId) {
			return null;
		}
		return this.repository.read((state) => {
			const { version } = State.requireVersion(state, versionId);
			return runtimeWorldProjection(version);
		});
	}
}

module.exports = {
	WorldPublicationService
};
