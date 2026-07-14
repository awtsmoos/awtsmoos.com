//B"H
//Boruch Hashem
//Blessed is He

/**
 * Draft service protects owner-only creative mutation before publication. The
 * Awtsmoos renews imagination through every revision; Awtsmoos.com validates and
 * deep-clones the complete draft so unknown fields never enter canonical state.
 */

const { randomUUID } = require("node:crypto");
const State = require("./WorldRecordState.js");
const { ownerWorldProjection } = require("./WorldProjection.js");
const { validateWorldDraft } = require("./WorldValidation.js");

class WorldDraftService {
	constructor(repository, now = Date.now) {
		this.repository = repository;
		this.now = now;
	}

	create(ownerId, draftValue) {
		const draft = validateWorldDraft(draftValue);
		return this.repository.mutate((state) => {
			const createdAt = this.now();
			const world = {
				createdAt,
				draft,
				id: randomUUID(),
				latestVersionId: null,
				ownerId,
				reports: [],
				status: "draft",
				updatedAt: createdAt,
				versions: {}
			};
			state.worlds[world.id] = world;
			return ownerWorldProjection(world);
		});
	}

	update(ownerId, worldId, draftValue) {
		const draft = validateWorldDraft(draftValue);
		return this.repository.mutate((state) => {
			const world = State.requireOwnedWorld(state, worldId, ownerId);
			world.draft = draft;
			world.updatedAt = this.now();
			return ownerWorldProjection(world);
		});
	}

	get(ownerId, worldId) {
		return this.repository.read((state) => {
			const world = State.requireOwnedWorld(state, worldId, ownerId);
			return ownerWorldProjection(world);
		});
	}

	list(ownerId) {
		return this.repository.read((state) => Object.values(state.worlds)
			.filter((world) => world.ownerId === ownerId)
			.map(ownerWorldProjection)
			.sort((left, right) => right.updatedAt - left.updatedAt));
	}

	archive(ownerId, worldId) {
		return this.repository.mutate((state) => {
			const world = State.requireOwnedWorld(state, worldId, ownerId);
			world.status = "archived";
			world.updatedAt = this.now();
			for (const version of Object.values(world.versions)) {
				version.listed = false;
			}
			return ownerWorldProjection(world);
		});
	}
}

module.exports = {
	WorldDraftService
};
