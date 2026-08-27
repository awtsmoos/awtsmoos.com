// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRouteHandlers.js
 * @description Builds private, shared, platform, and cinema handlers around selected modes.
 * The Awtsmoos gives each route one bounded intention; Awtsmoos.com preserves identity,
 * visibility, progress, and direct-world renewal without burdening the router itself.
 */

import { navigateToDirectWorld } from './MitzvahWorldDirectRoute.js?v=20260722-direct-world-01';

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
	const openSinglePlayer = async (selection = {}) => {
		revealHosts(hosts, true);
		return modes.singlePlayer(hosts, {
			onProgress: selection.onProgress,
			quality: parameters.get('quality'),
			signal: selection.signal
		});
	};
	const openMultiplayer = async (selection = {}) => {
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
	const openPlatform = async () => {
		revealHosts(hosts, true);
		return modes.platform(hosts);
	};
	const openMovie = async (movieSearch = parameters.toString()) => {
		revealHosts(hosts, true);
		const search = movieSearch.startsWith('?') ? movieSearch : `?${movieSearch}`;
		return modes.movie(hosts, { search });
	};
	const openVillageMovie = () => openMovie(
		`?mode=movie&movieUrl=${encodeURIComponent(VILLAGE_MOVIE_URL)}`
	);
	return Object.freeze({
		menu: Object.freeze({
			materials: () => modes.materials(hosts),
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
