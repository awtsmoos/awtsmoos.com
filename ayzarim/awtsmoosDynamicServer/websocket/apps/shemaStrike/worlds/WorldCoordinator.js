//B"H
//Boruch Hashem
//Blessed is He

/**
 * The world coordinator composes drafts, publication, discovery, community, and
 * verified identity without owning their details. The Awtsmoos renews creator
 * and world; Awtsmoos.com keeps every durable mutation tied to trusted identity.
 */

const { WorldCommunityService } = require("./WorldCommunityService.js");
const { WorldDiscoveryService } = require("./WorldDiscoveryService.js");
const { WorldDraftService } = require("./WorldDraftService.js");
const { WorldPublicationService } = require("./WorldPublicationService.js");

class WorldCoordinator {
	constructor(repository, identityProvider, options = {}) {
		this.repository = repository;
		this.identity = identityProvider;
		this.drafts = new WorldDraftService(repository, options.now);
		this.publication = new WorldPublicationService(repository, options.now);
		this.discovery = new WorldDiscoveryService(repository);
		this.community = new WorldCommunityService(
			repository,
			this.drafts,
			options.now
		);
	}

	create(client, draft) {
		return this.drafts.create(this.ownerId(client), draft);
	}

	update(client, worldId, draft) {
		return this.drafts.update(this.ownerId(client), worldId, draft);
	}

	get(client, worldId) {
		return this.drafts.get(this.ownerId(client), worldId);
	}

	listOwned(client) {
		return this.drafts.list(this.ownerId(client));
	}

	publish(client, worldId) {
		return this.publication.publish(this.ownerId(client), worldId);
	}

	unpublish(client, versionId) {
		return this.publication.unpublish(this.ownerId(client), versionId);
	}

	archive(client, worldId) {
		return this.drafts.archive(this.ownerId(client), worldId);
	}

	fork(client, versionId) {
		return this.community.fork(this.ownerId(client), versionId);
	}

	report(client, versionId, reason) {
		return this.community.report(this.ownerId(client), versionId, reason);
	}

	discover(filters) {
		return this.discovery.list(filters);
	}

	getPublic(versionId) {
		return this.publication.getPublic(versionId);
	}

	resolvePublishedWorld(versionId) {
		return this.publication.resolveRuntime(versionId);
	}

	ownerId(client) {
		return this.identity.requireVerified(client).accountId;
	}
}

module.exports = {
	WorldCoordinator
};
