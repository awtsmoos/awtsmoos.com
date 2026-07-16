// B"H
/** Routes local tools and makes the normal village URL a same-origin shared world by default. */
import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { launchMaterialDiagnostic } from '../diagnostics/MaterialDiagnosticMode.js';
import { createMovieStudio } from '../movie/MovieStudio.js';
import { hasMovieRequest, loadRequestedMovie } from '../movie/MovieProject.js';
import { createMultiplayerEretzRuntime } from '../network/MultiplayerEretzRuntime.js';
import { launchPlatformShowcase } from '../world/platform/PlatformShowcaseMode.js';
import { setGameHostsVisible, showMainMenu } from './MainMenu.js';

const VILLAGE_MOVIE_URL = './movies/projects/reference-village-60s.json';

export async function launchMitzvahWorld(hosts, search = location.search) {
	const params = new URLSearchParams(search);
	const realtimeUrl = params.get('realtimeUrl')
		|| globalThis.AwtsmoosRealtimeUrl
		|| inferRealtimeUrl(globalThis.location);
	const openSinglePlayer = async () => {
		setGameHostsVisible(hosts, true);
		return createEretzRuntime(hosts, { quality: params.get('quality'), startLoop: true });
	};
	const openMultiplayer = async selection => {
		setGameHostsVisible(hosts, true);
		return createMultiplayerEretzRuntime(hosts, {
			WebSocketClass: globalThis.WebSocket,
			displayName: selection.playerName || params.get('displayName') || uniqueDisplayName(),
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
	const openVillageMovie = () => openMovie(`?mode=movie&movieUrl=${encodeURIComponent(VILLAGE_MOVIE_URL)}`);
	if (params.get('mode') === 'materials') {
		setGameHostsVisible(hosts, false);
		return launchMaterialDiagnostic(hosts);
	}
	if (params.get('mode') === 'world') {
		if (params.get('session') === 'singleplayer' || !realtimeUrl || !globalThis.WebSocket) return openSinglePlayer();
		return openMultiplayer({});
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
		realtimeUrl,
		WebSocketClass: globalThis.WebSocket
	});
}

export function inferRealtimeUrl(locationValue = globalThis.location) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) return null;
	return `${locationValue.protocol === 'https:' ? 'wss:' : 'ws:'}//${locationValue.host}`;
}

function uniqueDisplayName() {
	const key = 'AwtsmoosMitzvahWorldTabName';
	try {
		const existing = sessionStorage.getItem(key);
		if (existing) return existing;
		const created = `Mountain Shliach ${Math.floor(100 + Math.random() * 900)}`;
		sessionStorage.setItem(key, created);
		return created;
	} catch {
		return 'Mountain Shliach';
	}
}

export default launchMitzvahWorld;
