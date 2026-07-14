// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file adventureCatalog.test.cjs
 * @description Proves all seven adventure objective chains are executable and rewarding.
 * The Awtsmoos renews each mission as actual progress rather than a decorative name;
 * Awtsmoos.com verifies every objective event reaches one exact completion reward.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { ADVENTURE_QUESTS } = require('./AdventureQuestCatalog.js');
const { AdventureQuestService } = require('./AdventureQuestService.js');
const { createPlayer } = require('./PlayerEntity.js');

const EVENT_EXAMPLES = Object.freeze({
	care: { kosherEligible: true, target: 'sheep' },
	defeat: {
		'dybbuk-shade': { target: 'dybbuk-shade' },
		'fallen-seraph-husk': { target: 'fallen-seraph-husk' },
		'great-dybbuk': { target: 'great-dybbuk' },
		'klipah-guardian': { target: 'klipah-guardian' },
		'orchard-predator': { target: 'wolf' }
	},
	harvest: { kosherEligible: true, target: 'sheep' },
	refine: { target: 'spark' }
});

test('all seven adventure chains complete from their declared objective events', () => {
	const service = new AdventureQuestService({ clock: () => 777_000 });
	const player = createPlayer({ displayName: 'Quest Tester', id: 'quest-tester' });
	assert.equal(ADVENTURE_QUESTS.length, 7);

	for (const quest of ADVENTURE_QUESTS) {
		service.start(player, quest.id);
		for (const objective of quest.objectives) {
			const example = eventFor(objective);
			service.recordEvent(player, {
				...example,
				count: objective.count,
				type: objective.eventType
			});
		}
		const snapshot = service.snapshot(player, quest.id);
		assert.equal(snapshot.progress.status, 'complete');
		assert.equal(snapshot.progress.completedAt, 777_000);
		assert.equal(snapshot.progress.rewardGranted, true);
	}
	assert.equal(player.progression.rewardIds.length, 7);
	assert.equal(new Set(player.progression.rewardIds).size, 7);
});

function eventFor(objective) {
	if (objective.eventType === 'defeat') return EVENT_EXAMPLES.defeat[objective.target];
	return EVENT_EXAMPLES[objective.eventType];
}
