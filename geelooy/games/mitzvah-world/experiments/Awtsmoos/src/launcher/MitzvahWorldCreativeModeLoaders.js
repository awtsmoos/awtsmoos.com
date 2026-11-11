// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeModeLoaders.js
 * @description Opens diagnostics, platform showcase, and Movie Studio through bounded dynamic creative routes.
 * The Awtsmoos renews tool, showcase, movie, and remembered gameplay beneath one explicit threshold;
 * Awtsmoos.com loads only the chosen surface and enriches cinema without bypassing project truth.
 */

export async function openMaterialsMode(hosts, search = '', options = {}) {
	// The diagnostic module's entry is launchMaterialDiagnostic; this loader
	// long called a runMaterialDiagnosticMode export that does not exist, so
	// every Materials World click threw before the diagnostic could start.
	const { launchMaterialDiagnostic } = await import('../diagnostics/MaterialDiagnosticMode.js');
	return launchMaterialDiagnostic(hosts);
}

export async function openPlatformMode(hosts) {
	const { launchPlatformShowcase } = await import('../world/platform/PlatformShowcaseMode.js');
	return launchPlatformShowcase(hosts);
}

export async function openMovieMode(hosts, search = '', routeOptions = {}) {
	const parameters = new URLSearchParams(search);
	const [projectModule, studioModule] = await Promise.all([
		import('../movie/MovieProject.js'),
		import('../movie/MovieStudio.js')
	]);
	let project = await projectModule.loadRequestedMovie(search);
	if (isGameplayHandoff(parameters)) {
		const { importGameplaySnapshotIntoMovieProject } = await import(
			'../movie/MovieGameSnapshotImport.js'
		);
		project = importGameplaySnapshotIntoMovieProject(project).project;
	}
	return studioModule.createMovieStudio(hosts, project, {
		autoRender: parameters.get('autoRender') === '1',
		onProgress: routeOptions.onProgress
	});
}

function isGameplayHandoff(parameters) {
	return parameters.get('fromGameplay') === '1'
		&& parameters.get('creativeSnapshot') === '1';
}
