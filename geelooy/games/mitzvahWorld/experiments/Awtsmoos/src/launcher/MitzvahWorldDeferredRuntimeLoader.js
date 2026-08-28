//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDeferredRuntimeLoader.js
 * @description Loads the small readable route shell only after intent, leaving CompactJS gathering for the specific heavy world actually selected.
 * The Awtsmoos reveals a light doorway before the chosen palace descends; Awtsmoos.com refuses to wrap a tiny route shell around every future room,
 * so one click hydrates only the navigation vessel and lets the selected runtime cross its own explicit compact gate when the player makes it bloom.
 */

const DEFERRED_RUNTIME_URL = './MitzvahWorldDeferredLaunchRuntime.js?v=20260827-lightning-launch-02';
let deferredRuntimePromise = null;

/**
 * @description Loads and caches the deferred route shell while allowing deterministic test injection.
 * @param {object} dependencies Optional injected launcher authorities.
 * @returns {Promise<object>} Deferred launch runtime module contract.
 */
export async function loadMitzvahWorldDeferredRuntime(dependencies = {}) {
	if (dependencies.deferredLaunchRuntime) {
		return dependencies.deferredLaunchRuntime;
	}

	if (!deferredRuntimePromise) {
		deferredRuntimePromise = import(DEFERRED_RUNTIME_URL).catch((error) => {
			deferredRuntimePromise = null;
			throw error;
		});
	}

	return deferredRuntimePromise;
}

/**
 * @description Creates menu handlers that hydrate route capability only after an intentional selection.
 * @param {object} context Immutable lightweight launch context.
 * @returns {object} Frozen lazy menu handler map.
 */
export function createLazyMitzvahWorldMenuHandlers(context) {
	const launchSelection = async (selection = {}) => {
		const runtime = await loadMitzvahWorldDeferredRuntime(context.dependencies);
		return runtime.launchDeferredMitzvahWorldMenuSelection(context, selection);
	};

	return Object.freeze({
		materials: launchSelection,
		missionMovie: launchSelection,
		movie: launchSelection,
		multiplayer: launchSelection,
		platform: launchSelection,
		singlePlayer: launchSelection
	});
}
