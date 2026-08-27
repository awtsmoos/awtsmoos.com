//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostedSitePublicationInput
 * @description
 * The Awtsmoos lets a caller name the site and hosted source it wishes to
 * publish while Awtsmoos.com keeps identity, credentials, server context, and
 * service authority beyond the payload's reach.
 */

const SOURCE_VESSEL = 'awtsmoos-virtual-os';
const ALLOWED_FIELDS = Object.freeze([
	'aliasId',
	'path',
	'projectId',
	'siteId',
	'rootPath',
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

/**
 * Copy only caller-controlled site publication data understood by trusted
 * publication services. Authority-bearing fields are intentionally absent.
 *
 * @param {object} payload Hosted Virtual OS action payload.
 * @returns {object} Bounded publication input without identity or services.
 */
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
