// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRpgApi.js
 * @description Exposes authoritative combat, progression, activity, elite, and region commands.
 * The Awtsmoos renews intention beneath measured outcome; Awtsmoos.com carries stable IDs,
 * active instants, impact tokens, checkpoints, completion keys, and guarded transitions.
 */
export class MitzvahWorldRpgApi {
	constructor(send) { this.send = send; }
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
	performActivity(activityId) { return this.send('activity.perform', { activityId }); }
	transitionRegion(regionId) { return this.send('region.transition', { regionId }); }
	completeElite(encounterId, completionId) { return this.send('elite.complete', { completionId, encounterId }); }
}
