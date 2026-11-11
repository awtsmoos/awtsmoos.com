// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPlatformCreativeLoader.js
 * @description The Procedural Platform's own compact door.
 * The platform showcase once shared one compact graph with the Movie Studio,
 * so a single click waited on a ~12.5 MB cold server build and the tab died;
 * this entry carries only the showcase, and its graph builds on its own.
 */

import { reportDirectWorldProgress } from './MitzvahWorldDirectRuntimeOptions.js';

const SHOWCASE_MODE_URL = '../world/platform/PlatformShowcaseMode.js';

export async function openPlatformMode(hosts, options = {}) {
	reportDirectWorldProgress(options, 'Loading the platform world module…', {
		stage: 'platform-world-module', url: SHOWCASE_MODE_URL
	});
	const { launchPlatformShowcase } = await import(SHOWCASE_MODE_URL);
	return launchPlatformShowcase(hosts, options);
}
