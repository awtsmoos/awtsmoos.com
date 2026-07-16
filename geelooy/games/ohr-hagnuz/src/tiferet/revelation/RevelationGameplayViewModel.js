// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RevelationGameplayViewModel.js
 * @description Selects truthful overhead HUD data without owning gameplay state.
 *
 * The Awtsmoos renews position, vitality, equipment, and fellowship every instant.
 * This selector lets Awtsmoos.com display those living facts without inventing a
 * second world or granting the browser authority it does not possess.
 */

const MAP_WIDTH = 13;
const MAP_HEIGHT = 7;

export function buildGameplayViewModel(state, registry = []) {
	const light = numberOr(state.Stats?.light, 100);
	const maxLight = Math.max(1, numberOr(state.Stats?.maxLight, 100));
	return {
		vitalityLabel: 'Living Light',
		vitality: light,
		maxVitality: maxLight,
		vitalityPercent: Math.round((light / maxLight) * 100),
		minimap: buildMinimap(state, registry),
		actions: buildActions(state),
		events: buildEvents(state)
	};
}

function buildMinimap(state, registry) {
	const heroX = Math.round(numberOr(state.Hero?.cx, 0));
	const heroY = Math.round(numberOr(state.Hero?.cy, 0));
	const originX = heroX - Math.floor(MAP_WIDTH / 2);
	const originY = heroY - Math.floor(MAP_HEIGHT / 2);
	const index = new Map(registry.map(tile => [`${tile.x}:${tile.y}`, tile]));
	const cells = [];
	for (let row = 0; row < MAP_HEIGHT; row += 1) {
		for (let column = 0; column < MAP_WIDTH; column += 1) {
			const x = originX + column;
			const y = originY + row;
			const tile = index.get(`${x}:${y}`);
			cells.push({
				x,
				y,
				kind: tileKind(tile),
				hero: x === heroX && y === heroY
			});
		}
	}
	return { width: MAP_WIDTH, height: MAP_HEIGHT, cells };
}

function tileKind(tile) {
	if (!tile) return 'unknown';
	if (tile.isPortal) return 'portal';
	if (tile.encounter || tile.isEnemy) return 'danger';
	if (tile.t === 'G_DIRT_PATH') return 'road';
	if (tile.char === '~' || tile.t?.includes('WATER')) return 'water';
	if (tile.solid) return 'solid';
	return 'ground';
}

function buildActions(state) {
	const weapon = humanize(state.Equipment?.weapon || 'WEAPON_NONE');
	const balmCount = numberOr(state.Inventory?.items?.balm);
	const wickCount = numberOr(state.Inventory?.items?.wick);
	return [
		{ key: 'A', name: weapon === 'Weapon None' ? 'Interact' : weapon, intent: 'A', count: null },
		{ key: 'B', name: 'PaRDeS Art', intent: 'B', count: null },
		{ key: 'I', name: 'Balm', panel: 'items', count: balmCount },
		{ key: 'J', name: 'Lost Wick', panel: 'journal', count: wickCount }
	];
}

function buildEvents(state) {
	const events = [];
	if (state.Message) events.push({ kind: 'world', text: String(state.Message) });
	const shared = globalThis.__OHR_HAGNUZ_SHARED_JOURNEY__;
	if (!shared || shared.connection === 'offline') {
		events.push({ kind: 'solo', text: 'Solo Journey · local save active' });
		return events;
	}
	events.push({ kind: 'shared', text: `Shared Journey · ${shared.connection}` });
	if (shared.lastMessageType) {
		events.push({ kind: 'shared', text: `Server event · ${humanize(shared.lastMessageType)}` });
	}
	if (shared.road?.lamp?.lit) events.push({ kind: 'shared', text: 'The shared lamp is burning.' });
	if (shared.road?.encounter && !shared.road.encounter.defeated) {
		events.push({
			kind: 'danger',
			text: `Veil Wisp · ${shared.road.encounter.health}/${shared.road.encounter.maxHealth}`
		});
	}
	if (shared.error) events.push({ kind: 'danger', text: String(shared.error) });
	return events.slice(0, 5);
}

function numberOr(value, fallback = 0) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function humanize(value) {
	return String(value)
		.replace(/[_-]+/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, letter => letter.toUpperCase());
}
