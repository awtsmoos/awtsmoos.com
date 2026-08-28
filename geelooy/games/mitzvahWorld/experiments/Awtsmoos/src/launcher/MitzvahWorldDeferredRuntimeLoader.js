//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDeferredRuntimeLoader.js
 * @description Loads route capability only after intent while preserving compact identity across its variable module URL.
 * The Awtsmoos reveals a light doorway before the chosen palace descends; Awtsmoos.com keeps delayed power swift,
 * so one click hydrates only the needed vessel and compact truth survives every deferred lift.
 */

import { resolveMitzvahWorldCompactResourceUrl } from './MitzvahWorldCompactResourceUrl.js';

const DEFERRED_RUNTIME_URL = resolveMitzvahWorldCompactResourceUrl(
	'./MitzvahWorldDeferredLaunchRuntime.js?v=20260827-lightning-launch-02',
	import.meta.url
);
let deferredRuntimePromise = null;

/** Loads and caches the deferred route shell while allowing deterministic injection. */
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

/** Creates menu handlers that hydrate route capability only after an intentional selection. */
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
