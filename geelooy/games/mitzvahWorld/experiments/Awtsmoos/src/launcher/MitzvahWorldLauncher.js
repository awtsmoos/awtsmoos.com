// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Routes the lightweight menu into lazily loaded game and creative modes.
 * The Awtsmoos renews each chosen world without burdening the first threshold with every
 * optional vessel; Awtsmoos.com lets the menu appear before cinema, tools, or terrain arrive.
 */

import { setGameHostsVisible, showMainMenu } from './MainMenu.js';
import {
	createMitzvahWorldModeLoaders,
	hasMovieRequest
} from './MitzvahWorldModeLoaders.js';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';

const VILLAGE_MOVIE_URL = './movies/projects/reference-village-60s.json';

export async function launchMitzvahWorld(hosts, search = globalThis.location?.search || '', dependencies = {}) {
	const parameters = new URLSearchParams(search);
	const environment = dependencies.environment || globalThis;
	const modes = dependencies.modeLoaders || createMitzvahWorldModeLoaders(environment);
	const revealHosts = dependencies.setGameHostsVisible || setGameHostsVisible;
	const renderMenu = dependencies.showMainMenu || showMainMenu;
	const realtimeUrl = parameters.get('realtimeUrl')
		|| environment.AwtsmoosRealtimeUrl
		|| inferRealtimeUrl(environment.location);
	const openSinglePlayer = async () => {
		revealHosts(hosts, true);
		return modes.singlePlayer(hosts, {
			quality: parameters.get('quality')
		});
	};
	const openMultiplayer = async (selection = {}) => {
		revealHosts(hosts, true);
		return modes.multiplayer(hosts, {
			displayName: selection.playerName
				|| parameters.get('displayName')
				|| uniqueDisplayName(environment),
			quality: parameters.get('quality'),
			realtimeUrl,
			worldId: selection.worldId
				|| parameters.get('worldId')
				|| 'main-village'
		});
	};
	const openPlatform = async () => {
		revealHosts(hosts, true);
		return modes.platform(hosts);
	};
	const openMovie = async (movieSearch = search) => {
		revealHosts(hosts, true);
		return modes.movie(hosts, { search: movieSearch });
	};
	const openVillageMovie = () => openMovie(
		`?mode=movie&movieUrl=${encodeURIComponent(VILLAGE_MOVIE_URL)}`
	);

	if (parameters.get('mode') === 'materials') {
		revealHosts(hosts, false);
		return modes.materials(hosts);
	}
	if (parameters.get('mode') === 'world') {
		return mitzvahWorldSessionMode(parameters) === 'singleplayer'
			? openSinglePlayer()
			: openMultiplayer();
	}
	if (parameters.get('mode') === 'platform') return openPlatform();
	if (parameters.get('mode') === 'mission-movie') return openVillageMovie();
	if (hasMovieRequest(parameters)) return openMovie();
	return renderMenu(hosts, {
		materials: () => modes.materials(hosts),
		missionMovie: openVillageMovie,
		movie: () => openMovie('?mode=movie&movie=referenceVillage60'),
		multiplayer: openMultiplayer,
		platform: openPlatform,
		singlePlayer: openSinglePlayer
	}, {
		WebSocketClass: environment.WebSocket,
		realtimeUrl
	});
}

export function inferRealtimeUrl(locationValue = globalThis.location) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) return null;
	return `${locationValue.protocol === 'https:' ? 'wss:' : 'ws:'}//${locationValue.host}`;
}

function uniqueDisplayName(environment = globalThis) {
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

export default launchMitzvahWorld;
