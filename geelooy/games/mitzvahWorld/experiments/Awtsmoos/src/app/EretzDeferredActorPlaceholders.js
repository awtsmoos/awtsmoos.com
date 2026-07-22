// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzDeferredActorPlaceholders.js
 * @description Preserves frame-loop contracts while optional world families stream later.
 * The Awtsmoos conceals a vessel without making absence dangerous; Awtsmoos.com supplies
 * honest no-op contracts so movement begins before horses, enemies, doors, lava, and shadows.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';

export function createDeferredActorSystems() {
	const npc = createNpcPlaceholder();
	return {
		doors: [],
		friendlyNpcs: population('friendly', npc),
		horses: animatedFamily('horses'),
		hostileNpcs: hostilePopulation(),
		houseVisibility: visibilityPlaceholder(),
		lava: lavaPlaceholder(),
		npc,
		shadows: shadowPlaceholder(),
		targetCoordinator: { destroy() {}, streaming: true },
		worldMode: worldModePlaceholder()
	};
}

function population(name, primary = null) {
	return {
		actors: [],
		clearAll() {},
		destroy() {},
		group: namedGroup(`Awtsmoos_deferred_${name}`),
		primary,
		stats: () => ({ actors: 0, status: 'streaming' }),
		update() {}
	};
}

function hostilePopulation() {
	return {
		...population('hostiles'),
		diagnostics: () => ({ active: 0, actors: [], status: 'streaming' }),
		selected: null
	};
}

function animatedFamily(name) {
	return {
		group: namedGroup(`Awtsmoos_deferred_${name}`),
		stats: () => ({ count: 0, status: 'streaming' }),
		update() {}
	};
}

function createNpcPlaceholder() {
	return {
		clear() {},
		dialogue() {},
		group: namedGroup('Awtsmoos_deferred_primary_npc'),
		profile: { id: 'streaming-primary-npc' },
		selected: false,
		target() {},
		update() {},
		x: 0,
		z: 0
	};
}

function lavaPlaceholder() {
	return {
		active: false,
		group: namedGroup('Awtsmoos_deferred_lava'),
		stats: () => ({ active: false, status: 'streaming' }),
		update() {}
	};
}

function shadowPlaceholder() {
	return {
		stats: () => ({ method: 'streaming', player: false }),
		update() {}
	};
}

function visibilityPlaceholder() {
	return {
		stats: () => ({ status: 'streaming', updates: 0 }),
		update() {}
	};
}

function worldModePlaceholder() {
	return {
		enterLava: () => false,
		mode: 'eretz',
		returnEretz: () => false,
		stats: () => ({ mode: 'eretz', status: 'streaming' })
	};
}

function namedGroup(name) {
	const group = new Group();
	group.name = name;
	group.visible = false;
	return group;
}
