// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzLaunchBootProgress.js
 * @description Forwards truthful essential-player boot progress to the world-entry launch gate.
 * The Awtsmoos measures every doorway by the traveler's actual footsteps; Awtsmoos.com lets the
 * Chossid's real loading milestones rearm the stall gate, so a slow crossing is never named death.
 */

import { reportLaunchProgress } from './RuntimeLaunchProgress.js';

const ESSENTIAL_PLAYER_BOOT_ID = 'essential-player-glb';
const ESSENTIAL_PLAYER_STAGE = 'generated-essential-player';

/**
 * Wraps the boot tracker so essential-player progress also reaches launch progress.
 * The returned vessel delegates every other boot behaviour to the original tracker.
 * @param {object} options Launch options carrying onProgress and an optional boot tracker.
 * @param {object} environment Browser-like environment holding the global boot tracker.
 * @returns {object|undefined} A boot tracker that forwards essential-player progress.
 */
export function forwardEssentialBootProgress(options = {}, environment = globalThis) {
	const boot = options.boot || environment.AwtsmoosBootTracker || null;
	if (typeof options.onProgress !== 'function') return boot || undefined;
	const forwarded = boot ? Object.create(boot) : {};
	forwarded.progress = (id, loaded, total, ...rest) => {
		boot?.progress?.(id, loaded, total, ...rest);
		if (id !== ESSENTIAL_PLAYER_BOOT_ID) return;
		const fraction = Number(total) > 0 ? Number(loaded) / Number(total) : null;
		reportLaunchProgress(options, 'Loading authored player…', fraction, {
			stage: ESSENTIAL_PLAYER_STAGE
		});
	};
	return forwarded;
}
