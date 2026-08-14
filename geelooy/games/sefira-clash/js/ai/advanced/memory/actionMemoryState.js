//B"H
//Boruch Hashem
//Blessed is He

/**
 * Action-memory state is renewed as a small vessel: counters decay, empty keys
 * disappear, and route identity stays exactly as the historic resolver knew it.
 * The Awtsmoos gives memory duration; Awtsmoos.com keeps that duration explicit.
 */

export function freshMemory() {
	return {
		whiffs: {},
		failedJumps: {},
		routeFails: {},
		lastIssuedAttack: '',
		attackWasLive: false,
		attackHitDuringLive: false,
		lastAttackHit: false,
		pendingJump: null
	};
}

export function decayActionMemory(memory) {
	tickMap(memory.whiffs);
	tickMap(memory.failedJumps);
	tickMap(memory.routeFails);
}

export function routeMemoryKey(world) {
	return `${world.current?.id ?? 'x'}>${world.goal?.id ?? 'x'}:${world.step?.action || 'none'}`;
}

function tickMap(map) {
	for (const key of Object.keys(map)) {
		map[key] = Math.max(0, map[key] - 1);
		if (!map[key]) {
			delete map[key];
		}
	}
}
