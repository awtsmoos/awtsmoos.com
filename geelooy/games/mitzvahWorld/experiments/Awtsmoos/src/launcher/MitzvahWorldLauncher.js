// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Routes the playable world, generated platform, material lab, and JSON cinema.
 */
import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { launchMaterialDiagnostic } from '../diagnostics/MaterialDiagnosticMode.js';
import { createMovieStudio } from '../movie/MovieStudio.js';
import { hasMovieRequest, loadRequestedMovie } from '../movie/MovieProject.js';
import { launchPlatformShowcase } from '../world/platform/PlatformShowcaseMode.js';
import { setGameHostsVisible, showMainMenu } from './MainMenu.js';

const MISSION_MOVIE_URL = '/games/mitzvahWorld/movies/projects/tefillin-shlichus-120s.json';

export async function launchMitzvahWorld(hosts, search = location.search) {
	const params = new URLSearchParams(search);
	const openWorld = async () => {
		setGameHostsVisible(hosts, true);
		return createEretzRuntime(hosts, { startLoop: true });
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
	const openMissionMovie = () => openMovie(
		`?mode=movie&movieUrl=${encodeURIComponent(MISSION_MOVIE_URL)}`
	);
	if (params.get('mode') === 'materials') {
		setGameHostsVisible(hosts, false);
		return launchMaterialDiagnostic(hosts);
	}
	if (params.get('mode') === 'world') return openWorld();
	if (params.get('mode') === 'platform') return openPlatform();
	if (params.get('mode') === 'mission-movie') return openMissionMovie();
	if (hasMovieRequest(search)) return openMovie();
	return showMainMenu(hosts, {
		materials: async () => launchMaterialDiagnostic(hosts),
		missionMovie: openMissionMovie,
		movie: () => openMovie('?mode=movie&movie=sample30'),
		platform: openPlatform,
		world: openWorld
	});
}

export default launchMitzvahWorld;
