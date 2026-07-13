// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { maps } from '../../js/data/maps.js';
import { generatePostgameWorldEvent } from '../../js/data/quests/campaign/postgameEvents.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const date = new Date('2026-07-13T12:00:00.000Z');
const first = generatePostgameWorldEvent(date);
const second = generatePostgameWorldEvent(date);
assert(JSON.stringify(first) === JSON.stringify(second), 'The same date produced different world events.');
assert(first.id === 'postgame_event_20260713', `Unexpected event id ${first.id}.`);
for (const objective of first.objectives) {
	for (const mapId of objective.mapId ? [objective.mapId] : []) {
		assert(maps[mapId], `${first.id} references missing map ${mapId}.`);
	}
}

const lockedState = createDefaultGameState();
lockedState.db.quests = { [first.id]: first };
lockedState.player.level = 100;
assert(Quests.getStatus(lockedState, first.id) === 'locked', 'World event unlocked before the ending.');

const unlockedState = createDefaultGameState();
unlockedState.db.quests = { [first.id]: first };
unlockedState.player.level = 100;
unlockedState.player.completedQuests.push('campaign_keter_08');
assert(Quests.getStatus(unlockedState, first.id) === 'available', 'World event did not unlock after Keter.');
assert(Quests.accept(unlockedState, first.id), 'World event could not be accepted.');
for (const objective of unlockedState.player.activeQuests[0].objectives) {
	Quests.emit(unlockedState, {
		type: objective.type,
		targetId: objective.targetId,
		quantity: objective.required,
		mapId: objective.mapIds?.[0]
	});
}
assert(Quests.getStatus(unlockedState, first.id) === 'ready', 'World event objectives did not complete.');
assert(Quests.finalize(unlockedState, first.id), 'World event could not turn in.');

console.log(JSON.stringify({
	ok: true,
	eventId: first.id,
	regionId: first.regionId,
	objectives: first.objectives.length
}, null, 2));
