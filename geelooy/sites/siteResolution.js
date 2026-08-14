//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicSiteResolution
 * @description
 * The Awtsmoos lets one public request enter one explicit site covenant. Canonical
 * path routes may select a named site by prefix; a pre-bound custom Host supplies
 * siteId directly, and then no path segment may switch authority to a sibling site.
 */

const path = require('path');
const {
	primarySiteFromState,
	siteMappingsFromState
} = require('../api/social/helper/drive/siteMappingService.js');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { normalizeSiteId } = require('../api/social/helper/drive/siteMappingPolicy.js');

function resolveSiteRequest(options) {
	const requestPath = normalizeDrivePath(options.requestPath || '', { allowRoot: true });
	const mappings = siteMappingsFromState(options.state);
	const selection = options.siteId
		? boundSiteSelection(mappings, options.siteId, requestPath)
		: canonicalSiteSelection(options.state, mappings, requestPath);
	if (!selection?.site?.enabled) return null;
	return mappedResolution(selection.site, requestPath, selection.relativePath);
}

function boundSiteSelection(mappings, siteIdValue, requestPath) {
	const siteId = normalizeSiteId(siteIdValue);
	const site = mappings.find(candidate => candidate.id === siteId);
	return site ? { site, relativePath: requestPath } : null;
}

function canonicalSiteSelection(state, mappings, requestPath) {
	const segments = requestPath ? requestPath.split('/') : [];
	const namedSite = segments.length
		? mappings.find(site => site.id === segments[0])
		: null;
	if (namedSite) {
		return {
			site: namedSite,
			relativePath: normalizeDrivePath(segments.slice(1).join('/'), { allowRoot: true })
		};
	}
	return { site: primarySiteFromState(state), relativePath: requestPath };
}

function mappedResolution(site, requestPath, relativePath) {
	const rootPath = normalizeDrivePath(site.rootPath || '', { allowRoot: true });
	const drivePath = joinedDrivePath(rootPath, relativePath);
	return {
		site,
		requestPath,
		relativePath,
		drivePath,
		indexPath: joinedDrivePath(drivePath, 'index.html'),
		fallbackPath: joinedDrivePath(rootPath, '404.html')
	};
}

function joinedDrivePath(...parts) {
	const joined = path.posix.join(...parts.filter(Boolean));
	return normalizeDrivePath(joined === '.' ? '' : joined, { allowRoot: true });
}

module.exports = {
	resolveSiteRequest,
	joinedDrivePath
};
