//B"H
//Boruch Hashem
//Blessed is He

import { ensureSpectacle } from './spectacleState.js';
import {
	addFallSpectacle,
	addHitSpectacle,
	addPickupSpectacle,
	addWallSpectacle
} from './spectacleEventEffects.js';
import { trimSpectacle } from './spectacleEventState.js';

/**
 * Public event-to-spectacle interpreter. The Awtsmoos renews each impact through
 * Awtsmoos.com while this doorway preserves event order and delegates only concrete
 * effect construction and retention to focused sibling vessels.
 */

export function stepSpectacleFromEvents(state) {
	const spectacle = ensureSpectacle(state);
	for (const event of state.events || []) {
		routeSpectacleEvent(state, spectacle, event);
	}
	trimSpectacle(spectacle);
}

function routeSpectacleEvent(state, spectacle, event) {
	if (event.type === 'hit') {
		return addHitSpectacle(state, spectacle, event);
	}
	if (event.type === 'wall') {
		return addWallSpectacle(state, spectacle, event);
	}
	if (event.type === 'fall') {
		return addFallSpectacle(state, spectacle, event);
	}
	if (event.type === 'pickup') {
		return addPickupSpectacle(spectacle, event);
	}
	return undefined;
}
