//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRouteHandlers.js
 * @description Preserves selected local and shared world identity while each route opens only its appointed runtime doorway.
 * The Awtsmoos gives every route one bounded intention; Awtsmoos.com carries the chosen world name intact from menu card to living ground.
 */

import { navigateToDirectWorld } from './MitzvahWorldDirectRoute.js?v=20260722-direct-world-01';
import { beginMitzvahWorldFirstPlayCustody } from '../app/MitzvahWorldEssentialBoot.js';
import { armMainMenuLaunchWitness } from './MainMenuLaunchWitness.js';

const VILLAGE_MOVIE_URL = './movies/projects/reference-village-60s.json';

export function createMitzvahWorldRouteHandlers(context) {
	const {
		environment,
		hosts,
		modes,
		parameters,
		realtimeUrl,
		revealHosts
	} = context;
	const beginWorldEntryCustody = () => {
		try {
			beginMitzvahWorldFirstPlayCustody(environment);
		} catch (error) {
			environment?.console?.warn?.(
				'B"H MitzvahWorld essential-gate custody failed; continuing world entry.',
				error
			);
		}
	};
	const openSinglePlayer = async (selection = {}) => {
		beginWorldEntryCustody();
		revealHosts(hosts, true);
		return modes.singlePlayer(hosts, {
			onProgress: selection.onProgress,
			quality: parameters.get('quality'),
			signal: selection.signal,
			worldId: selection.worldId || parameters.get('worldId') || undefined
		});
	};
	const openMultiplayer = async (selection = {}) => {
		beginWorldEntryCustody();
		revealHosts(hosts, true);
		return modes.multiplayer(hosts, {
			displayName: selection.playerName
				|| parameters.get('displayName')
				|| uniqueDisplayName(environment),
			onProgress: selection.onProgress,
			quality: parameters.get('quality'),
			realtimeUrl,
			signal: selection.signal,
			worldId: selection.worldId
				|| parameters.get('worldId')
				|| 'main-village'
		});
	};
	const navigateMultiplayer = selection => navigateToDirectWorld(
		environment,
		selection,
		{
			displayName: selection.playerName || uniqueDisplayName(environment),
			quality: parameters.get('quality'),
			realtimeUrl: parameters.get('realtimeUrl'),
			worldId: selection.worldId
		}
	);
	const openPlatform = async (selection = {}) => {
		revealHosts(hosts, true);
		return modes.platform(hosts, {
			onProgress: selection.onProgress,
			signal: selection.signal
		});
	};
	const openMovie = async (movieSearch = parameters.toString(), selection = {}) => {
		beginWorldEntryCustody();
		// A direct movie route never passes a menu click, so no launch task ever
		// arms the essential gate's launch witness for it — yet the route IS a
		// guarded first-play crossing (custody above). Arm the same witness the
		// menu launch task arms, and feed its pen from the movie runtime's own
		// truthful progress reports, so launch-gated facts (spawn terrain,
		// canonical chossid) are judged by this crossing's witnessed progress
		// instead of by a silence clock the movie path could never hear.
		const witness = armMainMenuLaunchWitness(environment, {
			onProgress: selection.onProgress
		});
		const onProgress = detail => witness.noteProgress(detail);
		revealHosts(hosts, true);
		const search = movieSearch.startsWith('?') ? movieSearch : `?${movieSearch}`;
		try {
			return await modes.movie(hosts, { onProgress, search });
		} finally {
			witness.settle();
		}
	};
	const openVillageMovie = () => openMovie(
		`?mode=movie&movieUrl=${encodeURIComponent(VILLAGE_MOVIE_URL)}`
	);
	return Object.freeze({
		menu: Object.freeze({
			materials: (selection = {}) => modes.materials(hosts, {
				onProgress: selection.onProgress,
				signal: selection.signal
			}),
			missionMovie: openVillageMovie,
			movie: () => openMovie('?mode=movie&movie=referenceVillage60'),
			multiplayer: navigateMultiplayer,
			platform: openPlatform,
			singlePlayer: openSinglePlayer
		}),
		openMovie,
		openMultiplayer,
		openPlatform,
		openSinglePlayer,
		openVillageMovie
	});
}

/** Gives each browser tab one stable default shared-world display name. */
function uniqueDisplayName(environment) {
	const key = 'AwtsmoosMitzvahWorldTabName';
	try {
		const existing = environment.sessionStorage?.getItem(key);
		if (existing) return existing;
		const created = `Mountain Shliach ${Math.floor(100 + Math.random() * 900)}`;
		environment.sessionStorage?.setItem(key, created);
		return created;
	} catch {
		return `Mountain Shliach ${Math.floor(100 + Math.random() * 900)}`;
	}
}
