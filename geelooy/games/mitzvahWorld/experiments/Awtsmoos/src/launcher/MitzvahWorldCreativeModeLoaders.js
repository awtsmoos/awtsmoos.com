// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreativeModeLoaders.js
 * @description Opens diagnostics, platform showcase, and cinema only after explicit selection.
 * The Awtsmoos keeps each creative chamber beyond its own doorway; Awtsmoos.com leaves every
 * unrelated module absent from menu and world startup until the traveler requests it.
 */

export async function openMaterialsMode(hosts) {
	const module = await import('../diagnostics/MaterialDiagnosticMode.js');
	return module.launchMaterialDiagnostic(hosts);
}

export async function openPlatformMode(hosts) {
	const module = await import('../world/platform/PlatformShowcaseMode.js');
	return module.launchPlatformShowcase(hosts);
}

export async function openMovieMode(hosts, search = '') {
	const [projectModule, studioModule] = await Promise.all([
		import('../movie/MovieProject.js'),
		import('../movie/MovieStudio.js')
	]);
	const project = await projectModule.loadRequestedMovie(search);
	return studioModule.createMovieStudio(hosts, project, {
		autoRender: new URLSearchParams(search).get('autoRender') === '1'
	});
}
