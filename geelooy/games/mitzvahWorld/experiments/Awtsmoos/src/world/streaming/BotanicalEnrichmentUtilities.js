// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalEnrichmentUtilities.js
 * @description Holds deferred module, idle, and removal vessels for village nature streaming.
 * The Awtsmoos lets each garden arrive in its proper hour and leave without a trace;
 * Awtsmoos.com keeps the scheduler small, so lifecycle truth remains easy to embrace.
 */

export function loadProceduralBotanicalModule() {
	return import('../village/VillageBotanicalEnrichmentSystem.js');
}

export function loadRealNatureModule() {
	return import('../nature/RealNatureSystem.js');
}

export function scheduleBotanicalIdle(callback) {
	if (typeof requestIdleCallback === 'function') {
		return requestIdleCallback(callback, { timeout: 1400 });
	}
	return setTimeout(callback, 32);
}

export function cancelBotanicalIdle(handle) {
	if (typeof cancelIdleCallback === 'function') {
		cancelIdleCallback(handle);
		return;
	}
	clearTimeout(handle);
}

export function removeBotanicalChild(group, child) {
	if (typeof group?.remove === 'function') {
		group.remove(child);
		return;
	}
	const index = group?.children?.indexOf(child) ?? -1;
	if (index >= 0) group.children.splice(index, 1);
}
