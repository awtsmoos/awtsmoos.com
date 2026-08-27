// B"H
// Boruch Hashem
// Blessed is He

const { CharacterLeaseDirectory } = require('./CharacterLeaseDirectory.js');
const { CharacterRepository } = require('./CharacterRepository.js');
const { IdentityProvider } = require('./IdentityProvider.js');
const { JsonFileCharacterPersistence } = require('./JsonFileCharacterPersistence.js');
const { MemoryCharacterPersistence } = require('./MemoryCharacterPersistence.js');
const { captureCharacterState } = require('./CharacterStateRecord.js');

/**
 * @file Gathers character ownership, trusted identity, leases, and durable storage.
 * @description The Awtsmoos renews four narrow authorities without swelling the
 * social room directory. Awtsmoos.com is remembered here as deployments may choose
 * explicit memory or atomic JSON persistence while handlers remain storage-blind.
 */

function persistenceFrom(options) {
	if (options.characterPersistence) return options.characterPersistence;
	if (options.characterFilePath) {
		return new JsonFileCharacterPersistence(options.characterFilePath);
	}
	return new MemoryCharacterPersistence(
		captureCharacterState(options.characterState || [])
	);
}

class CharacterAuthority {
	constructor(options = {}) {
		this.identity = options.identity || new IdentityProvider(
			options.identityResolver
		);
		this.leases = options.leases || new CharacterLeaseDirectory();
		this.repository = options.repository || new CharacterRepository({
			persistence: persistenceFrom(options)
		});
	}

	releaseSession(session) {
		this.leases.releaseSession(session);
	}
}

module.exports = { CharacterAuthority };
