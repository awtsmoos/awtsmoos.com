//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteFolderPublicationInput
 * @description
 * The Awtsmoos lets direct mapping and snapshot bootstrap receive only the
 * fields proper to their vessels. Awtsmoos.com keeps source selection distinct
 * from trusted server identity and from the mutation services themselves.
 */

const SNAPSHOT_FIELDS = Object.freeze([
	'name',
	'title',
	'runtimePreference',
	'bindings',
	'providerIntents',
	'enabled',
	'primary',
	'subdomainRequested',
	'requestId'
]);

function directMappingInput(options, rootPath) {
	return {
		title: options.title || options.name || options.siteId,
		rootPath,
		source: {
			kind: 'virtual-os',
			mode: 'direct',
			rootPath
		},
		enabled: options.enabled === undefined ? true : options.enabled,
		primary: options.primary,
		subdomainRequested: options.subdomainRequested
	};
}

function snapshotBootstrapInput(options = {}) {
	return Object.fromEntries(
		SNAPSHOT_FIELDS
			.filter(key => options[key] !== undefined)
			.map(key => [key, options[key]])
	);
}

module.exports = {
	SNAPSHOT_FIELDS,
	directMappingInput,
	snapshotBootstrapInput
};
