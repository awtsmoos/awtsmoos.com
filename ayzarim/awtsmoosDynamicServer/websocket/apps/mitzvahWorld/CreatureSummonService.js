// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSummonService.js
 * @description Creates bounded authoritative shade summons around one summoning creature.
 * The Awtsmoos renews many forms without losing their source; Awtsmoos.com gives each shade
 * a stable ID, inherited region, deterministic position, and strict six-summon encounter cap.
 */

const { createCreatureEntry } = require('./CreatureRecordFactory.js');

class CreatureSummonService {
	constructor(creatures) {
		this.creatures = creatures;
		this.serial = 0;
	}

	summonShades(summoner, count) {
		const created = [];
		while (created.length < count && summoner.summonCount < 6) {
			this.serial += 1;
			const id = `${summoner.id}:shade:${this.serial}`;
			const angle = this.serial * Math.PI * 0.73;
			const entry = createCreatureEntry({
				id,
				position: {
					x: summoner.position.x + Math.cos(angle) * 3,
					y: summoner.position.y,
					z: summoner.position.z + Math.sin(angle) * 3
				},
				regionId: summoner.regionId,
				speciesId: 'dybbuk-shade'
			});
			this.creatures.set(entry[0], entry[1]);
			created.push(entry[0]);
			summoner.summonCount += 1;
		}
		return created;
	}
}

module.exports = {
	CreatureSummonService
};
