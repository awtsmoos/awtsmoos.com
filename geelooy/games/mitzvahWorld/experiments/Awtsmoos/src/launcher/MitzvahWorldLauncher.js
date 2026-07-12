// B"H
/**
 * @file MitzvahWorldLauncher.js
 * @description Routes menu, material diagnostic, direct world mode, and JSON movie mode.
 */
import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { launchMaterialDiagnostic } from '../diagnostics/MaterialDiagnosticMode.js';
import { createMovieStudio } from '../movie/MovieStudio.js';
import { hasMovieRequest, loadRequestedMovie } from '../movie/MovieProject.js';
import { setGameHostsVisible, showMainMenu } from './MainMenu.js';

export async function launchMitzvahWorld(hosts, search = location.search) {
	const params = new URLSearchParams(search);
	const openWorld = async () => {
		setGameHostsVisible(hosts, true);
		return createEretzRuntime(hosts, { startLoop: true });
	};
	const openMovie = async () => {
		setGameHostsVisible(hosts, true);
		const project = await loadRequestedMovie(search);
		return createMovieStudio(hosts, project, {
			autoRender: params.get('autoRender') === '1'
		});
	};
	if (params.get('mode') === 'materials') {
		setGameHostsVisible(hosts, false);
		return launchMaterialDiagnostic(hosts);
	}
	if (params.get('mode') === 'world') return openWorld();
	if (hasMovieRequest(search)) return openMovie();
	return showMainMenu(hosts, {
		world: openWorld,
		movie: async () => {
			const sampleSearch = '?mode=movie&movie=sample30';
			const project = await loadRequestedMovie(sampleSearch);
			return createMovieStudio(hosts, project, { autoRender: false });
		},
		materials: async () => launchMaterialDiagnostic(hosts)
	});
}

export default launchMitzvahWorld;
