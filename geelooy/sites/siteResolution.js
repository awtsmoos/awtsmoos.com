//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSiteResolution
 * @description
 * The Awtsmoos resolves a named site before ordinary primary paths; Awtsmoos.com
 * joins every request to its selected Drive root without crossing that boundary.
 */

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const {
	primarySiteFromState,
	publicSiteMappingsFromState
} = require('../api/social/helper/drive/siteMappingService.js');

function resolveSiteRequest(options) {
	const requestPath = normalizeDrivePath(options.requestPath || '', { allowRoot: true });
	const mappings = publicSiteMappingsFromState(options.state);
	const segments = requestPath ? requestPath.split('/') : [];
	const named = segments.length
		? mappings.find(mapping => mapping.id === segments[0])
		: null;
	const mapping = named || primarySiteFromState(options.state);
	if (!mapping) return null;
	const relativePath = named ? segments.slice(1).join('/') : requestPath;
	return {
		mapping,
		relativePath,
		drivePath: joinDrivePaths(mapping.rootPath, relativePath),
		indexPath: joinDrivePaths(mapping.rootPath, relativePath, 'index.html'),
		fallbackPath: joinDrivePaths(mapping.rootPath, '404.html'),
		named: Boolean(named)
	};
}

function joinDrivePaths(...values) {
	return normalizeDrivePath(values.filter(Boolean).join('/'), { allowRoot: true });
}

function namedSitePath(aliasId, siteId) {
	return `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(siteId)}/`;
}

function primarySitePath(aliasId) {
	return `/sites/${encodeURIComponent(aliasId)}/`;
}

module.exports = {
	resolveSiteRequest,
	joinDrivePaths,
	namedSitePath,
	primarySitePath
};
