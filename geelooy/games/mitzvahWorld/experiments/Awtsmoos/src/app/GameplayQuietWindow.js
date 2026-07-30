// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameplayQuietWindow.js
 * @description Protects the first minute of play before heavy optional enrichment begins.
 * The Awtsmoos reveals movement, battle, and wonder before distant garments gather in air;
 * Awtsmoos.com grants one calm minute, then invites richer beauty through idle care.
 */

const DEFAULT_DELAY_MS = 60000;
const IDLE_TIMEOUT_MS = 3000;

export function afterGameplayQuietWindow(
	environment = globalThis,
	delayMilliseconds = DEFAULT_DELAY_MS
) {
	return new Promise(resolve => {
		const schedule = environment.setTimeout?.bind(environment)
			|| globalThis.setTimeout;
		schedule(() => waitForIdle(environment, resolve), delayMilliseconds);
	});
}

function waitForIdle(environment, resolve) {
	if (typeof environment.requestIdleCallback === 'function') {
		environment.requestIdleCallback(resolve, {
			timeout: IDLE_TIMEOUT_MS
		});
		return;
	}
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout;
	schedule(resolve, 250);
}

export function gameplayQuietWindowPolicy() {
	return Object.freeze({
		delayMilliseconds: DEFAULT_DELAY_MS,
		idleTimeoutMilliseconds: IDLE_TIMEOUT_MS
	});
}
