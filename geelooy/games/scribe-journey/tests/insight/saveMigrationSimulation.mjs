// B"H

import { createDefaultGameState, TILE_SIZE } from '../../js/data/database.js';
import { maps } from '../../js/data/maps.js';
import { SAVE_KEYS } from '../../js/persistence/constants.js';
import { createSaveService } from '../../js/persistence/saveService.js';

class FakeStorage {
	constructor() {
		this.values = new Map();
		this.failKey = null;
	}
	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}
	setItem(key, value) {
		if (key === this.failKey) throw new Error('Quota exceeded.');
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
		bots: [],
		lightLevel: 1000,
		stats: { battlesWon: 0 },
		time: { totalMinutes: 720, accumulated: 0, day: 1 },
		weather: 'clear'
	});
	state.player.storage = [];
	state.player.unlockedGates37 = [];
	state.player.wisdomPoints = 0;
	return state;
}

function makeService(storage) {
	let tick = 0;
	return createSaveService({
		storage,
		clock: () => new Date(Date.UTC(2026, 6, 12, 15, tick++)),
		createFreshState: freshState,
		maps,
		tileSize: TILE_SIZE
	});
}

const storage = new FakeStorage();
const service = makeService(storage);
const state = freshState();
const legacyBytes = new TextEncoder().encode(JSON.stringify(state)).length;
state.player.x = 6;
state.player.flags.firstSpark = true;
state.stats.battlesWon = 3;
const first = service.save(state);
assert(first.bytes < legacyBytes / 20, `Compact save is unexpectedly large: ${first.bytes}/${legacyBytes}`);
assert(!first.text.includes('"db"'), 'Static registries must not appear in compact saves.');

state.player.x = 7;
const second = service.save(state);
assert(second.backedUp, 'A validated prior primary should become backup.');
const roundTrip = service.load();
assert(roundTrip.state.player.x === 7, 'Current save must round-trip player position.');
assert(roundTrip.state.player.flags.firstSpark, 'Player flags must survive round trip.');
assert(roundTrip.state.stats.battlesWon === 3, 'Top-level stats must survive round trip.');
assert(roundTrip.state.db.items, 'Fresh static registries must be restored after load.');

storage.setItem(SAVE_KEYS.primary, '{"broken":');
const recovered = service.load();
assert(recovered.source === 'backup', 'A broken primary must recover from backup.');
assert(recovered.state.player.x === 6, 'Backup must contain the previous valid save.');

const tampered = JSON.parse(first.text);
tampered.payload.player.x = 99;
let checksumRejected = false;
try { service.decodeText(JSON.stringify(tampered)); } catch { checksumRejected = true; }
assert(checksumRejected, 'Tampered current saves must fail integrity verification.');

const legacyStorage = new FakeStorage();
const legacyState = freshState();
legacyState.player.x = 8;
legacyStorage.setItem(SAVE_KEYS.legacy, JSON.stringify(legacyState));
const migrated = makeService(legacyStorage).load();
assert(migrated.source === 'legacy' && migrated.migrated, 'Historic full-state saves must migrate.');
assert(migrated.state.player.x === 8, 'Legacy progress must survive migration.');
assert(legacyStorage.getItem(SAVE_KEYS.primary), 'Legacy migration must write a modern primary.');

const badMap = freshState();
badMap.currentMapId = 'missing_realm';
badMap.player.x = 9999;
const repaired = service.importText(JSON.stringify(badMap));
assert(repaired.state.currentMapId === 'malkuth_village', 'Unknown maps must return to the starting map.');
assert(repaired.state.player.x < 100, 'Invalid coordinates must be clamped.');

const quotaStorage = new FakeStorage();
const quotaService = makeService(quotaStorage);
const quotaState = freshState();
const durable = quotaService.save(quotaState).text;
quotaStorage.failKey = SAVE_KEYS.primary;
let quotaFailed = false;
try { quotaState.player.x = 9; quotaService.save(quotaState); } catch { quotaFailed = true; }
assert(quotaFailed, 'Quota failure must be observable.');
assert(quotaStorage.getItem(SAVE_KEYS.primary) === durable, 'Quota failure must preserve the old primary.');

console.log(JSON.stringify({
	ok: true,
	legacyBytes,
	compactBytes: first.bytes,
	ratio: Number((first.bytes / legacyBytes).toFixed(5)),
	checks: 17
}));
