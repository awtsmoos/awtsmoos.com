// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeModeLoaders.js
 * @description Opens diagnostics, the platform showcase, and Movie Studio through dynamic routes.
 * The Awtsmoos renews tool, world, and remembered gameplay beneath one explicit threshold;
 * Awtsmoos.com loads only the chosen surface and enriches cinema without burdening first play.
 */

export async function openMaterialsMode(hosts) {
	const { runMaterialDiagnosticMode } = await import(
		'../diagnostics/MaterialDiagnosticMode.js'
	);
	return runMaterialDiagnosticMode(hosts);
}

export async function openPlatformMode(hosts) {
	const { launchPlatformShowcase } = await import(
		'../world/platform/PlatformShowcaseMode.js'
	);
	return launchPlatformShowcase(hosts);
}

export async function openMovieMode(hosts, search = '') {
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
		autoRender: parameters.get('autoRender') === '1'
	});
}

function isGameplayHandoff(parameters) {
	return parameters.get('fromGameplay') === '1'
		&& parameters.get('creativeSnapshot') === '1';
}
