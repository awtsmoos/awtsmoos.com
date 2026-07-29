// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRpgApi.js
 * @description Exposes typed combat, expansion, upgrade, bounty, care, loot, and adventure commands.
 * The Awtsmoos renews intention beneath measured outcome; Awtsmoos.com carries every action,
 * journey, material choice, exact claim, impact token, weapon, guard, and mission without forgery.
 */

export class MitzvahWorldRpgApi {
	constructor(send) {
		this.send = send;
	}

	adventures() { return this.send('adventure.list'); }
	adventureSnapshot(questId = null) { return this.send('adventure.snapshot', { questId }); }
	startAdventure(questId) { return this.send('adventure.start', { questId }); }
	adventureStep(questId, stepId) { return this.send('adventure.step', { questId, stepId }); }

	attack(creatureId, action = {}) {
		return this.send('combat.attack', {
			actionId: action.actionId,
			creatureId,
			elapsedSeconds: action.elapsedSeconds,
			impactToken: action.impactToken,
			intent: action.intent || 'defense',
			weaponId: action.weaponId
		});
	}

	defend(actionId) { return this.send('combat.defend', { actionId }); }
	combatTick(steps = 1) { return this.send('combat.tick', { steps }); }
	combatSnapshot() { return this.send('combat.snapshot'); }
	care(creatureId) { return this.send('creature.care', { creatureId }); }
	creatures() { return this.send('creature.snapshot'); }
	loot(creatureId) { return this.send('loot.claim', { creatureId }); }
	harvest(creatureId) { return this.send('harvest.perform', { creatureId }); }
	progressionSnapshot() { return this.send('progression.snapshot'); }

	performActivity(activityId, completionId = crypto.randomUUID()) {
		return this.send('activity.perform', { activityId, completionId });
	}

	transitionRegion(regionId) {
		return this.send('region.transition', { regionId });
	}

	completeElite(encounterId, completionId) {
		return this.send('elite.complete', { encounterId, completionId });
	}

	upgradeEquipment(upgradeId) {
		return this.send('equipment.upgrade', { upgradeId });
	}

	claimBounty(bountyId) {
		return this.send('bounty.claim', { bountyId });
	}
}
