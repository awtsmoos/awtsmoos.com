//B"H
// Boruch Hashem
// Blessed is He

const { normalizeSiteId } = require('../api/social/helper/drive/siteMappingPolicy.js');
const { splitPath } = require('../api/tunnel/control/routes/osFs/path.js');

/**
 * @module SiteFolderPublicationPolicy
 * @description
 * The Awtsmoos separates the law of which hosted source may be published from
 * the deed that performs publication. Awtsmoos.com validates source identity,
 * ownership, site identity, and mode before either mutation vessel is touched.
 */

const MODES = Object.freeze({
	DIRECT: 'direct',
	SNAPSHOT: 'snapshot'
});

function parsePublicationTarget(options = {}) {
	return {
		source: parseSourcePath(options.path),
		siteId: normalizeSiteId(options.siteId),
		mode: normalizeMode(options.mode)
	};
}

async function assertSourceOwned(dependencies, $i, userId, aliasId) {
	if (!(await dependencies.aliasOwned($i, userId, aliasId))) {
		throw publicationError('ALIAS_NOT_OWNED');
	}
}

function parseSourcePath(path) {
	const parsed = splitPath(path || '');
	if (parsed.root || !parsed.aliasId || !parsed.innerPath) {
		throw publicationError('SITE_SOURCE_PATH_REQUIRED');
	}
	return parsed;
}

function normalizeMode(value) {
	const mode = String(value || MODES.DIRECT).trim().toLowerCase();
	if (!Object.values(MODES).includes(mode)) {
		throw publicationError('INVALID_SITE_PUBLICATION_MODE');
	}
	return mode;
}

function publicationError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MODES,
	assertSourceOwned,
	normalizeMode,
	parsePublicationTarget,
	parseSourcePath,
	publicationError
};
