//B"H
// Boruch Hashem
// Blessed is He

const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const {
	SOURCE_KINDS,
	effectiveSiteSource
} = require('../api/social/helper/drive/siteSourcePolicy.js');
const { assertDirectPublicPath } = require('./directSitePathPolicy.js');

/**
 * @module SiteSourceResolution
 * @description
 * The Awtsmoos gives canonical identity first and transport second, so Awtsmoos.com may reveal Drive snapshot, Virtual OS direct files, or a living hosted project without confusing storage, process, and public name in one vessel.
 */
function resolveSiteSource(site = {}, relativePath = '') {
	const source = effectiveSiteSource(site);
	const requestedPath = normalizeDrivePath(relativePath || '', { allowRoot: true });
	if (source.kind === SOURCE_KINDS.VIRTUAL_OS) {
		return resolveVirtualOsSource(source, requestedPath);
	}
	if (source.kind === SOURCE_KINDS.HOSTED_PROJECT) {
		return resolveHostedProjectSource(source, requestedPath);
	}
	return resolveDriveSource(source, requestedPath);
}

function resolveHostedProjectSource(source, relativePath) {
	return {
		kind: SOURCE_KINDS.HOSTED_PROJECT,
		mode: source.mode,
		ownerKey: source.ownerKey,
		projectId: source.projectId,
		relativePath
	};
}

function resolveVirtualOsSource(source, requestedPath) {
	const relativePath = assertDirectPublicPath(requestedPath);
	return {
		kind: SOURCE_KINDS.VIRTUAL_OS,
		mode: source.mode,
		rootPath: source.rootPath,
		relativePath,
		entryRelativePath: joinRelative(relativePath, 'index.html')
	};
}

function resolveDriveSource(source, requestedPath) {
	return {
		kind: SOURCE_KINDS.DRIVE,
		mode: source.mode,
		rootPath: source.rootPath,
		relativePath: requestedPath,
		drivePath: joinRoot(source.rootPath, requestedPath),
		entryDrivePath: joinRoot(source.rootPath, joinRelative(requestedPath, 'index.html'))
	};
}

function joinRoot(rootPath, relativePath) {
	return normalizeDrivePath(
		[rootPath, relativePath].filter(Boolean).join('/'),
		{ allowRoot: true }
	);
}

function joinRelative(relativePath, child) {
	return normalizeDrivePath(
		[relativePath, child].filter(Boolean).join('/'),
		{ allowRoot: true }
	);
}

module.exports = {
	joinRoot,
	resolveSiteSource
};
