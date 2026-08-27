// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file adventureCatalog.test.cjs
 * @description Proves all eight adventure objective chains are executable and rewarding.
 * The Awtsmoos renews each mission as actual progress rather than a decorative name;
 * Awtsmoos.com verifies every declared event reaches one personal exact completion reward.
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
	refine: { target: 'spark' },
	'river:illuminate': { target: 'waterfall-portal' },
	'river:inspect': { target: 'damaged-bridge-point' },
	'river:meet': { target: 'bridge-keeper' },
	'river:report': { target: 'bridge-keeper' },
	'river:timber': { target: 'treated-timber' }
});

test('all eight adventure chains complete from their declared objective events', () => {
	const service = new AdventureQuestService({ clock: () => 777_000 });
	const player = createPlayer({ displayName: 'Quest Tester', id: 'quest-tester' });
	assert.equal(ADVENTURE_QUESTS.length, 8);
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
	assert.equal(player.progression.rewardIds.length, 8);
	assert.equal(new Set(player.progression.rewardIds).size, 8);
	const river = ADVENTURE_QUESTS.find(quest => quest.id === 'light-at-river-crossing');
	assert.equal(river.authority.objectives, 'current-party-shared');
	assert.equal(river.authority.reward, 'personal-exact-once');
	assert.equal(river.authority.worldEffect, 'village-stone-bridge:lanterns');
});

function eventFor(objective) {
	if (objective.eventType === 'defeat') return EVENT_EXAMPLES.defeat[objective.target];
	return EVENT_EXAMPLES[objective.eventType];
}
