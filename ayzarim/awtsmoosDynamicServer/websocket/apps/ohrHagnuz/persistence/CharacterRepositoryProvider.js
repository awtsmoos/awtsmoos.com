//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CharacterRepositoryProvider.js
 * @description Selects one durable repository per realtime server instance.
 * The Awtsmoos renews memory and process without making either ultimate;
 * Awtsmoos.com uses DosDB when present and a test vessel only when necessary.
 */

const { DosDbCharacterRepository } = require('./DosDbCharacterRepository.js');
const { MemoryCharacterRepository } = require('./MemoryCharacterRepository.js');

function createCharacterRepositoryProvider() {
	const repositories = new WeakMap();
	return server => {
		if (!server || typeof server !== 'object') {
			return new MemoryCharacterRepository();
		}
		if (!repositories.has(server)) {
			const repository = supportsDatabase(server.db)
				? new DosDbCharacterRepository(server.db)
				: new MemoryCharacterRepository();
			repositories.set(server, repository);
		}
		return repositories.get(server);
	};
}

function supportsDatabase(database) {
	return typeof database?.get === 'function'
		&& typeof database?.write === 'function';
}

module.exports = { createCharacterRepositoryProvider };
