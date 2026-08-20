//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicSiteResolution
 * @description
 * The Awtsmoos lets one public request enter one explicit garden without
 * stealing a sibling road. Awtsmoos.com distinguishes bound custom-domain
 * identity, named canonical prefixes, primary alias roads, and blocked gardens
 * so later layers reveal only the identity the route itself already proves.
 */

const path = require('path');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const {
	normalizeSiteRegistry,
	normalizeSiteId
} = require('../api/social/helper/drive/siteMappingPolicy.js');
const {
	primarySiteFromState,
	siteMappingsFromState
} = require('../api/social/helper/drive/siteMappingService.js');

function resolveSiteRequest(options = {}) {
	const requestPath = normalizeDrivePath(options.requestPath || '', { allowRoot: true });
	const mappings = siteMappingsFromState(options.state);
	if (options.siteId) {
		return boundResolution(mappings, options.siteId, requestPath);
	}
	return canonicalResolution(options.state, requestPath);
}

function boundResolution(mappings, siteIdValue, requestPath) {
	const siteId = normalizeSiteId(siteIdValue);
	const mapping = mappings.find(candidate => candidate.id === siteId);
	if (!mapping) return null;
	if (!mapping.enabled) return blockedResolution(mapping, requestPath, false, true);
	return activeResolution(mapping, requestPath, requestPath, false, true);
}

function canonicalResolution(state, requestPath) {
	const segments = requestPath ? requestPath.split('/') : [];
	const explicitMappings = Object.values(normalizeSiteRegistry(state?.sites));
	const namedMapping = segments.length
		? explicitMappings.find(mapping => mapping.id === segments[0])
		: null;
	if (namedMapping) {
		const relativePath = normalizeDrivePath(
			segments.slice(1).join('/'),
			{ allowRoot: true }
		);
		if (!namedMapping.enabled) {
			return blockedResolution(namedMapping, relativePath, true, false);
		}
		return activeResolution(namedMapping, requestPath, relativePath, true, false);
	}
	const primary = primarySiteFromState(state);
	if (!primary) return null;
	if (!primary.enabled) return blockedResolution(primary, requestPath, false, false);
	return activeResolution(primary, requestPath, requestPath, false, false);
}

function activeResolution(mapping, requestPath, relativePath, named, bound) {
	const rootPath = normalizeDrivePath(mapping.rootPath || '', { allowRoot: true });
	const drivePath = joinedDrivePath(rootPath, relativePath);
	return {
		site: mapping,
		mapping,
		requestPath,
		relativePath,
		drivePath,
		indexPath: joinedDrivePath(drivePath, 'index.html'),
		fallbackPath: joinedDrivePath(rootPath, '404.html'),
		named,
		bound,
		blocked: false
	};
}

function blockedResolution(mapping, relativePath, named, bound) {
	return {
		site: mapping,
		mapping,
		requestPath: relativePath,
		relativePath,
		drivePath: null,
		indexPath: null,
		fallbackPath: null,
		named,
		bound,
		blocked: true
	};
}

function joinedDrivePath(...parts) {
	const joined = path.posix.join(...parts.filter(Boolean));
	return normalizeDrivePath(joined === '.' ? '' : joined, { allowRoot: true });
}

function joinDrivePaths(...parts) {
	return joinedDrivePath(...parts);
}

function namedSitePath(aliasId, siteId) {
	return `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(siteId)}/`;
}

function primarySitePath(aliasId) {
	return `/sites/${encodeURIComponent(aliasId)}/`;
}

module.exports = {
	resolveSiteRequest,
	joinedDrivePath,
	joinDrivePaths,
	namedSitePath,
	primarySitePath
};
