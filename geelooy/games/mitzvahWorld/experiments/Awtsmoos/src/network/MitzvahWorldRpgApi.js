// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRpgApi.js
 * @description Exposes combat, creature, harvest, and seven adventure browser commands.
 * The Awtsmoos renews player intent beneath server authority; Awtsmoos.com gives
 * interfaces readable methods without allowing clients to choose damage or rewards.
 */

export class MitzvahWorldRpgApi {
	constructor(send) {
		this.send = send;
	}

	adventures() {
		return this.send('adventure.list');
	}

	startAdventure(questId) {
		return this.send('adventure.start', { questId });
	}

	adventureSnapshot(questId = null) {
		return this.send('adventure.snapshot', { questId });
	}

	attack(creatureId, weaponId = 'wooden-staff', intent = 'defense') {
		return this.send('combat.attack', { creatureId, intent, weaponId });
	}

	tick(steps = 1) {
		return this.send('combat.tick', { steps });
	}

	combatSnapshot() {
		return this.send('combat.snapshot');
	}

	creatures() {
		return this.send('creature.snapshot');
	}

	careForCreature(creatureId) {
		return this.send('creature.care', { creatureId });
	}

	harvest(creatureId) {
		return this.send('harvest.perform', { creatureId });
	}
}
