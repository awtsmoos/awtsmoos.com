//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosSiteResolution
 * @description
 * The Awtsmoos distinguishes an explicit named garden from the old road home;
 * Awtsmoos.com confines every enabled mapping to its normalized Drive root while legacy aliases remain whole.
 */

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { normalizeSiteRegistry } = require('../api/social/helper/drive/siteMappingPolicy.js');
const { primarySiteFromState } = require('../api/social/helper/drive/siteMappingService.js');

function resolveSiteRequest(options) {
	const requestPath = normalizeDrivePath(options.requestPath || '', {
		allowRoot: true
	});
	const segments = requestPath ? requestPath.split('/') : [];
	const explicitMappings = Object.values(normalizeSiteRegistry(options.state?.sites));
	const explicitNamed = segments.length
		? explicitMappings.find((mapping) => mapping.id === segments[0])
		: null;
	if (explicitNamed && !explicitNamed.enabled) {
		return blockedResolution(explicitNamed, segments.slice(1).join('/'));
	}
	const mapping = explicitNamed || primarySiteFromState(options.state);
	if (!mapping) {
		return null;
	}
	const relativePath = explicitNamed
		? segments.slice(1).join('/')
		: requestPath;
	return activeResolution(mapping, relativePath, Boolean(explicitNamed));
}

function activeResolution(mapping, relativePath, named) {
	return {
		mapping,
		relativePath,
		drivePath: joinDrivePaths(mapping.rootPath, relativePath),
		indexPath: joinDrivePaths(mapping.rootPath, relativePath, 'index.html'),
		fallbackPath: joinDrivePaths(mapping.rootPath, '404.html'),
		named,
		blocked: false
	};
}

function blockedResolution(mapping, relativePath) {
	return {
		mapping,
		relativePath,
		drivePath: null,
		indexPath: null,
		fallbackPath: null,
		named: true,
		blocked: true
	};
}

function joinDrivePaths(...values) {
	return normalizeDrivePath(values.filter(Boolean).join('/'), {
		allowRoot: true
	});
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
