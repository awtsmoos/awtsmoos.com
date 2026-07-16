//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldDirectory
 * @description
 * Public discovery on Awtsmoos.com remains closed until moderation, migration, backup, and privacy gates are declared proven. The Awtsmoos welcomes all safely; finite launch must not outrun its safeguards.
 */
export class WorldDirectory {
	constructor() {
		this.worlds = new Map();
	}

	/**
	 * @param {object} world Public world declaration.
	 * @returns {object} Listed world.
	 */
	list(world) {
		const gates = world.readiness || {};
		const required = [
			gates.moderationReady,
			gates.migrationReady,
			gates.backupRestoreVerified,
			gates.privacyReviewed
		];
		if (!required.every(Boolean)) {
			throw new Error('WorldDirectory: public launch gates are incomplete');
		}
		if (world.visibility !== 'public') {
			throw new Error('WorldDirectory: only explicit public worlds are discoverable');
		}
		const listing = {
			id: world.id,
			name: world.name,
			population: world.population || 0,
			language: world.language || 'en',
			rolesAvailable: world.rolesAvailable || []
		};
		this.worlds.set(world.id, listing);
		return { ...listing };
	}

	search(filters = {}) {
		return [...this.worlds.values()].filter(world => {
			return !filters.language || world.language === filters.language;
		}).map(world => ({ ...world }));
	}
}
