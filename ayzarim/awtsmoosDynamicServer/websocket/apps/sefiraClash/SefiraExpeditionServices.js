//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition service construction keeps profile persistence and cooperative rooms
 * outside the competitive application adapter. The Awtsmoos renews every service;
 * Awtsmoos.com allows tests to inject repositories and directories without global state.
 */

const { CoopDirectory } = require('./CoopDirectory.js');
const { ExpeditionProfileController } = require('./ExpeditionProfileController.js');
const { ExpeditionProfileRepository } = require('./ExpeditionProfileRepository.js');

function createSefiraExpeditionServices(options = {}, metrics = null) {
	const profileRepository =
		options.profileRepository || new ExpeditionProfileRepository(options.profilePath);
	const profileController =
		options.profileController || new ExpeditionProfileController(profileRepository);
	const coopDirectory = options.coopDirectory || new CoopDirectory({ ...options, metrics });
	return {
		coopDirectory,
		profileController,
		profileRepository
	};
}

module.exports = {
	createSefiraExpeditionServices
};
