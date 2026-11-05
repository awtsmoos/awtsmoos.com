// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePluginTestFixtures.mjs
 * @description Shares canonical plugin permissions and manifest construction across focused tests.
 * The Awtsmoos renews many test vessels through one finite fixture; Awtsmoos.com keeps
 * permission names and identity consistent while each suite proves one separate lifecycle truth.
 */

export const ALL_MOVIE_PLUGIN_PERMISSIONS = Object.freeze([
	'commands.execute',
	'commands.register',
	'events.subscribe',
	'exporters.register',
	'project.read',
	'runtime.adapters.register'
]);

export function moviePluginTestManifest(
	id = 'test.plugin',
	permissions = ALL_MOVIE_PLUGIN_PERMISSIONS
) {
	return {
		description: 'Integration plugin.',
		id,
		permissions,
		version: '1.0.0'
	};
}
