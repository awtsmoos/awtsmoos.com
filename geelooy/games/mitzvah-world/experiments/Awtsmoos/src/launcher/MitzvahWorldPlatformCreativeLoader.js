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

export async function openPlatformMode(hosts) {
	const { launchPlatformShowcase } = await import('../world/platform/PlatformShowcaseMode.js');
	return launchPlatformShowcase(hosts);
}
