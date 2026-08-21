//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostedSitePublicationInput
 * @description
 * The Awtsmoos lets callers name source and publication intent while identity
 * stays hidden in the trusted server. Awtsmoos.com copies only bounded fields;
 * credentials, actor overrides, and service objects can never cross this gate.
 */

const SOURCE_VESSEL = 'awtsmoos-virtual-os';
const ALLOWED_FIELDS = Object.freeze([
	'aliasId',
	'path',
	'projectId',
	'siteId',
	'rootPath',
	'publicPath',
	'entryFile',
	'verify',
	'mode',
	'name',
	'title',
	'runtimePreference',
	'bindings',
	'providerIntents',
	'enabled',
	'primary',
	'subdomainRequested',
	'files',
	'requestId'
]);

function normalizeSitePublicationInput(payload = {}) {
	const source = payload && typeof payload === 'object' ? payload : {};
	const normalized = {};

	for (const field of ALLOWED_FIELDS) {
		if (Object.prototype.hasOwnProperty.call(source, field)) {
			normalized[field] = source[field];
		}
	}

	normalized.sourceVessel = SOURCE_VESSEL;
	return normalized;
}

module.exports = {
	ALLOWED_FIELDS,
	SOURCE_VESSEL,
	normalizeSitePublicationInput
};
