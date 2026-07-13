// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState, TILE_SIZE } from '../../js/data/database.js';
import { maps } from '../../js/data/maps.js';
import { checksumFor } from '../../js/persistence/checksum.js';
import { GAME_ID, SAVE_VERSION } from '../../js/persistence/constants.js';
import { createSaveService } from '../../js/persistence/saveService.js';

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}
	getItem(key) {
		return this.values.get(key) || null;
	}
	setItem(key, value) {
		this.values.set(key, String(value));
	}
	removeItem(key) {
		this.values.delete(key);
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function freshState() {
	const state = createDefaultGameState();
	Object.assign(state, {
		activeGates: {},
		stats: {},
		time: { totalMinutes: 720, day: 1 },
		weather: 'clear',
		lightLevel: 1000
	});
	return state;
}

const service = createSaveService({
	storage: new MemoryStorage(),
	clock: () => new Date('2026-07-13T08:00:00Z'),
	createFreshState: freshState,
	maps,
	tileSize: TILE_SIZE
});

const state = freshState();
state.player.activeQuests.push({
	id: 'malkuth_test',
	status: 'in_progress',
	objectives: [{ id: 'step', current: 2, required: 5, completed: false }]
});
state.player.trackedQuestId = 'malkuth_test';
state.player.reputation.malkuth_village = 75;
state.player.worldChanges.fountain_restored = true;
state.player.rewardedQuests.push('old_reward');
const saved = service.save(state);
assert(saved.document.version === SAVE_VERSION, 'New Chronicles must use the current version.');
const loaded = service.load().state;
assert(loaded.player.activeQuests[0].objectives[0].current === 2, 'Objective progress must survive save/load.');
assert(loaded.player.trackedQuestId === 'malkuth_test', 'Tracked quest must survive save/load.');
assert(loaded.player.reputation.malkuth_village === 75, 'Reputation must survive save/load.');
assert(loaded.player.worldChanges.fountain_restored, 'World restoration must survive save/load.');
assert(loaded.player.rewardedQuests.includes('old_reward'), 'Reward guards must survive save/load.');

const oldPayload = {
	currentMapId: 'malkuth_village',
	player: {
		x: 5,
		y: 8,
		direction: 'up',
		money: { perutah: 1 },
		inventory: [],
		team: [],
		activeQuests: [],
		completedQuests: [],
		flags: {},
		mapChanges: {}
	}
};
const oldBody = {
	game: GAME_ID,
	version: 1,
	createdAt: '2026-07-12T00:00:00.000Z',
	updatedAt: '2026-07-12T00:00:00.000Z',
	payload: oldPayload
};
const oldDocument = { ...oldBody, checksum: checksumFor(oldBody) };
const migrated = service.decodeText(JSON.stringify(oldDocument));
assert(migrated.migrated, 'Version one Chronicles must migrate.');
assert(Array.isArray(migrated.state.player.rewardedQuests), 'Migration must add reward guards.');
assert(migrated.state.player.reputation && typeof migrated.state.player.reputation === 'object', 'Migration must add reputation.');
assert(migrated.state.player.trackedQuestId === null, 'Migration must add a safe tracked quest value.');

console.log(JSON.stringify({ ok: true, checks: 9, saveBytes: saved.bytes }));
