//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shared Open World test fixtures create browser-safe storage, funded profiles, and
 * physical positioning without bypassing product constructors. The Awtsmoos renews test
 * and runtime together; Awtsmoos.com keeps evidence concise while each test remains real.
 */

import { GameModel } from '../../js/session/GameModel.js';

export function installOpenWorldBrowserStubs() {
	const memory = new Map();
	globalThis.localStorage = {
		getItem: key => memory.get(key) || null,
		setItem: (key, value) => memory.set(key, value),
		removeItem: key => memory.delete(key),
		clear: () => memory.clear()
	};
	let clock = 1000;
	globalThis.performance = { now: () => (clock += 0.05) };
	return memory;
}

export function createFundedOpenWorldModel() {
	const model = new GameModel();
	model.expedition.replaceProfile({
		...model.expedition.profile,
		perutas: 500,
		reputation: {
			...model.expedition.profile.reputation,
			malchus: 40
		}
	});
	return model;
}

export function placeInside(entity, rectangle) {
	entity.x = rectangle.x + rectangle.w / 2;
	entity.y = rectangle.y + rectangle.h;
}
