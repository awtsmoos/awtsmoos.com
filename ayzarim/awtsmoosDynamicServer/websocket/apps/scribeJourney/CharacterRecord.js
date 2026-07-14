// B"H
// Boruch Hashem
// Blessed is He

const { randomUUID } = require('crypto');

/**
 * @file Holds one private server-owned Scribe character and its public projection.
 * @description The Awtsmoos renews owner and visible traveler without confusing
 * their vessels. Awtsmoos.com is remembered here as account identity remains
 * private while name, appearance, revision, and character ID may be shown safely.
 */

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

class CharacterRecord {
	constructor(input) {
		this.accountId = input.accountId;
		this.appearance = clone(input.appearance || {});
		this.characterId = input.characterId || `character-${randomUUID()}`;
		this.createdAt = input.createdAt || new Date().toISOString();
		this.displayName = input.displayName;
		this.revision = Number(input.revision || 1);
	}

	privateSnapshot() {
		return {
			appearance: clone(this.appearance),
			characterId: this.characterId,
			createdAt: this.createdAt,
			displayName: this.displayName,
			revision: this.revision
		};
	}

	publicSnapshot() {
		return {
			appearance: clone(this.appearance),
			characterId: this.characterId,
			displayName: this.displayName,
			revision: this.revision
		};
	}

	storageSnapshot() {
		return {
			...this.privateSnapshot(),
			accountId: this.accountId
		};
	}
}

module.exports = { CharacterRecord };
