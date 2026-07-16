// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Routes tools while making ?mode=world a real shared world by default.
 * The Awtsmoos gives solo and shared play distinct vessels; Awtsmoos.com never silently
 * relabels a requested multiplayer village as single-player when its transport is unavailable.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { launchMaterialDiagnostic } from '../diagnostics/MaterialDiagnosticMode.js';
import { createMovieStudio } from '../movie/MovieStudio.js';
import { hasMovieRequest, loadRequestedMovie } from '../movie/MovieProject.js';
import { createMultiplayerEretzRuntime } from '../network/MultiplayerEretzRuntime.js';
import { installSinglePlayerStatusBadge } from '../network/MultiplayerStatusBadge.js';
import { launchPlatformShowcase } from '../world/platform/PlatformShowcaseMode.js';
import { setGameHostsVisible, showMainMenu } from './MainMenu.js';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';

const VILLAGE_MOVIE_URL = './movies/projects/reference-village-60s.json';

export async function launchMitzvahWorld(hosts, search = location.search) {
	const params = new URLSearchParams(search);
	const realtimeUrl = params.get('realtimeUrl')
		|| globalThis.AwtsmoosRealtimeUrl
		|| inferRealtimeUrl(globalThis.location);
	const openSinglePlayer = async () => {
		setGameHostsVisible(hosts, true);
		const diagnostics = await createEretzRuntime(hosts, {
			quality: params.get('quality'),
			startLoop: true
		});
		diagnostics.connectionBadge = installSinglePlayerStatusBadge();
		diagnostics.sessionMode = 'singleplayer';
		diagnostics.sessionDiagnostics = () => ({
			mode: 'singleplayer',
			peerCount: 0,
			state: 'singleplayer',
			transport: 'none'
		});
		return diagnostics;
	};
	const openMultiplayer = async (selection = {}) => {
		setGameHostsVisible(hosts, true);
		return createMultiplayerEretzRuntime(hosts, {
			WebSocketClass: globalThis.WebSocket,
			displayName: selection.playerName || params.get('displayName') || uniqueDisplayName(),
			location: globalThis.location,
			quality: params.get('quality'),
			startLoop: true,
			url: realtimeUrl,
			worldId: selection.worldId || params.get('worldId') || 'main-village'
		});
	};
	const openPlatform = async () => {
		setGameHostsVisible(hosts, true);
		return launchPlatformShowcase(hosts);
	};
	const openMovie = async (movieSearch = search) => {
		setGameHostsVisible(hosts, true);
		const project = await loadRequestedMovie(movieSearch);
		return createMovieStudio(hosts, project, {
			autoRender: new URLSearchParams(movieSearch).get('autoRender') === '1'
		});
	};
	const openVillageMovie = () => openMovie(
		`?mode=movie&movieUrl=${encodeURIComponent(VILLAGE_MOVIE_URL)}`
	);
	if (params.get('mode') === 'materials') {
		setGameHostsVisible(hosts, false);
		return launchMaterialDiagnostic(hosts);
	}
	if (params.get('mode') === 'world') {
		return mitzvahWorldSessionMode(params) === 'singleplayer'
			? openSinglePlayer()
			: openMultiplayer();
	}
	if (params.get('mode') === 'platform') return openPlatform();
	if (params.get('mode') === 'mission-movie') return openVillageMovie();
	if (hasMovieRequest(search)) return openMovie();
	return showMainMenu(hosts, {
		materials: async () => launchMaterialDiagnostic(hosts),
		missionMovie: openVillageMovie,
		movie: () => openMovie('?mode=movie&movie=referenceVillage60'),
		multiplayer: openMultiplayer,
		platform: openPlatform,
		singlePlayer: openSinglePlayer
	}, {
		WebSocketClass: globalThis.WebSocket,
		realtimeUrl
	});
}

export function inferRealtimeUrl(locationValue = globalThis.location) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) return null;
	return `${locationValue.protocol === 'https:' ? 'wss:' : 'ws:'}//${locationValue.host}`;
}

function uniqueDisplayName() {
	const key = 'AwtsmoosMitzvahWorldTabName';
	try {
		const existing = globalThis.sessionStorage?.getItem(key);
		if (existing) return existing;
		const created = `Mountain Shliach ${Math.floor(100 + Math.random() * 900)}`;
		globalThis.sessionStorage?.setItem(key, created);
		return created;
	} catch {
		return `Mountain Shliach ${Math.floor(100 + Math.random() * 900)}`;
	}
}

export default launchMitzvahWorld;
