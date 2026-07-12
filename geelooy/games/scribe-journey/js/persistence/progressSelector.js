// B"H

import { PERSISTED_TOP_LEVEL_FIELDS } from './constants.js';
import { toCanonicalData } from './canonicalJson.js';

function stablePlayer(player = {}) {
	const selected = toCanonicalData(player);
	const x = Number.isFinite(selected.x) ? selected.x : 0;
	const y = Number.isFinite(selected.y) ? selected.y : 0;
	return {
		...selected,
		isMoving: false,
		moveStartTime: 0,
		pixelX: undefined,
		pixelY: undefined,
		startX: x,
		startY: y,
		targetX: x,
		targetY: y
	};
}

/**
 * Selects only mutable progress. Static registries already live in source, and
 * transient animation cannot become more truthful by being copied into a save.
 */
export function selectProgress(state = {}) {
	const progress = {};
	for (const field of PERSISTED_TOP_LEVEL_FIELDS) {
		if (field === 'player' || state[field] === undefined) continue;
		progress[field] = toCanonicalData(state[field]);
	}
	progress.player = stablePlayer(state.player);
	return toCanonicalData(progress);
}
