// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverCrossingService.js
 * @description Validates ordered co-op bridge actions and applies one persisted lantern effect.
 * The Awtsmoos joins many hands in one measured repair; Awtsmoos.com refuses distant,
 * duplicate, out-of-order, or inactive evidence while personal rewards remain exact-once.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { squaredDistance } = require('./CreatureBrain.js');
const {
	RIVER_QUEST_ID,
	riverActionDefinition
} = require('./RiverCrossingActionCatalog.js');

class RiverCrossingService {
	constructor(options) {
		this.adventures = options.adventures;
		this.effects = options.effects;
		this.inventory = options.inventory;
		this.membersFor = options.membersFor || (player => [player]);
	}
	perform(player, stepId) {
		const action = riverActionDefinition(stepId);
		if (!action) throw new RealtimeError('RIVER_STEP_NOT_FOUND', 'Unknown river repair step.');
		const progress = this.requireCurrentStep(player, action);
		this.requireNearby(player, action);
		const recipients = this.activeRecipients(player);
		for (const recipient of recipients) this.markEvidence(recipient, stepId);
		let inventory = null;
		if (action.grantsTimber) inventory = this.inventory.add(player, 'treated-timber', 1);
		const adventures = this.adventures.recordEvent(player, {
			count: 1,
			target: action.target,
			type: action.eventType
		});
		const completed = recipients.some(recipient => {
			return recipient.adventureQuests[RIVER_QUEST_ID]?.status === 'complete';
		});
		const worldEffect = completed && action.eventType === 'river:report'
			? this.effects.apply('village-stone-bridge:lanterns', 'lit', {
				sourceQuestId: RIVER_QUEST_ID,
				target: 'village-stone-bridge',
				type: 'bridge:lanterns'
			})
			: null;
		return { adventures, inventory, progress, stepId, worldEffect };
	}
	activeRecipients(player) {
		return this.membersFor(player).filter(recipient => {
			return recipient.adventureQuests[RIVER_QUEST_ID]?.status === 'active';
		});
	}
	requireCurrentStep(player, action) {
		const snapshot = this.adventures.snapshot(player, RIVER_QUEST_ID);
		const progress = snapshot.progress;
		if (!progress || progress.status !== 'active') {
			throw new RealtimeError('RIVER_ADVENTURE_INACTIVE', 'Start the river mission first.');
		}
		const objective = snapshot.definition.objectives[progress.objectiveIndex];
		if (objective.eventType !== action.eventType || objective.target !== action.target) {
			throw new RealtimeError('RIVER_STEP_OUT_OF_ORDER', 'That repair step is not current.');
		}
		return progress;
	}
	requireNearby(player, action) {
		if (squaredDistance(player.position, action.position) <= action.radius * action.radius) return;
		throw new RealtimeError('RIVER_STEP_OUT_OF_RANGE', 'Move closer to the repair marker.');
	}
	markEvidence(player, stepId) {
		const progress = player.adventureQuests[RIVER_QUEST_ID];
		progress.evidence ||= [];
		if (progress.evidence.includes(stepId)) {
			throw new RealtimeError('RIVER_STEP_ALREADY_RECORDED', 'That repair evidence is recorded.');
		}
		progress.evidence.push(stepId);
	}
}

module.exports = {
	RiverCrossingService
};
