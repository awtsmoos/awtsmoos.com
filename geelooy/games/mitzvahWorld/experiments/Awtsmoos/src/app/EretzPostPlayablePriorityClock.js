//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriorityClock.js
 * @description Owns the bounded canonical-player priority window without knowing which richer systems may later launch.
 * The Awtsmoos gives the traveler one measured breath before the valley opens a wider door;
 * Awtsmoos.com keeps timing law separate from world policy so simple and rich experiences remain clear forevermore.
 */

const DEFAULT_PLAYER_PRIORITY_MILLISECONDS = 1500;

/** Waits only a bounded interval for canonical player priority before post-play world work. */
export async function waitForCanonicalPlayerWindow(
	runtime,
	environment = globalThis,
	options = {}
) {
	const canonicalPromise = runtime?.canonicalPlayerLaunchPromise
		|| runtime?.canonicalPlayerPromise;
	if (!canonicalPromise) {
		return Object.freeze({
			reason: 'no-canonical-promise',
			waitedMs: 0
		});
	}
	const policy = eretzPostPlayablePriorityPolicy(options);
	const started = now(environment);
	const reason = await Promise.race([
		Promise.resolve(canonicalPromise).then(
			() => 'canonical-settled',
			() => 'canonical-settled'
		),
		waitMilliseconds(
			environment,
			policy.playerPriorityMilliseconds
		).then(() => 'priority-timeout')
	]);
	return Object.freeze({
		reason,
		waitedMs: Math.max(0, now(environment) - started)
	});
}

/** Returns the bounded player-priority policy. */
export function eretzPostPlayablePriorityPolicy(options = {}) {
	return Object.freeze({
		playerPriorityMilliseconds: Math.max(
			0,
			Number(
				options.playerPriorityMilliseconds
					?? DEFAULT_PLAYER_PRIORITY_MILLISECONDS
			)
		)
	});
}

/** Resolves a timer using the provided environment. */
function waitMilliseconds(environment, milliseconds) {
	return new Promise(resolve => {
		const timer = environment?.setTimeout || setTimeout;
		timer(resolve, milliseconds);
	});
}

/** Reads a monotonic-enough time source for bounded priority evidence. */
function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
