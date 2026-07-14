//B"H
//Boruch Hashem
//Blessed is He

/**
 * Service composition gives arena, social, and creative worlds one shared
 * verified identity and repository without sharing domain internals. The
 * Awtsmoos renews all vessels; Awtsmoos.com keeps their dependencies explicit.
 */

const { ArenaDirectory } = require("./ArenaDirectory.js");
const { ShemaStateRepository } = require("./persistence/ShemaStateRepository.js");
const { ShemaRequestRouter } = require("./protocol/ShemaRequestRouter.js");
const { ShemaIdentityProvider } = require("./social/ShemaIdentityProvider.js");
const { SocialCoordinator } = require("./social/SocialCoordinator.js");
const { WorldCoordinator } = require("./worlds/WorldCoordinator.js");

function createShemaServices(directoryValue = null, options = {}) {
	const repository = options.repository
		|| new ShemaStateRepository(options.persistence);
	const identity = options.identityProvider
		|| new ShemaIdentityProvider(options.identityResolver);
	const worlds = options.worldCoordinator
		|| new WorldCoordinator(repository, identity, options.worldOptions);
	const directory = directoryValue || new ArenaDirectory({
		...options.arenaOptions,
		worldResolver: worlds
	});
	directory.setWorldResolver(worlds);
	const social = options.socialCoordinator || new SocialCoordinator(directory, {
		...options.socialOptions,
		identityProvider: identity,
		repository
	});
	const router = new ShemaRequestRouter(directory, social, worlds);
	return {
		directory,
		identity,
		repository,
		router,
		social,
		worlds
	};
}

module.exports = {
	createShemaServices
};
