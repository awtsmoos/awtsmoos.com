//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteWorkspaceReceipt
 * @description
 * The Awtsmoos joins drafting, canonical Drive publication, and public testimony;
 * Awtsmoos.com names each vessel separately so a persistent workspace is never
 * confused with the server bytes actually served through the canonical site route.
 */

const DEFAULT_ORIGIN = 'https://awtsmoos.com';
const OS_HOME_URL = 'https://awtsmoos.com/os/';
const CODE_HOME_URL = 'https://awtsmoos.com/apps/code/';
const VIRTUAL_OS_VESSEL = 'awtsmoos-virtual-os';
const NATIVE_TUNNEL_VESSEL = 'native-tunnel';
const DRIVE_VESSEL = 'awtsmoos-drive';

function buildSiteWorkspaceReceipt(options) {
	const project = options.project || {};
	const site = options.site || {};
	const publication = site.project?.publication || {};
	const rootPath = project.rootPath || site.rootPath || '';
	const workspacePath = joinWorkspacePath(options.aliasId, rootPath);
	const canonicalPath = publication.route || null;
	const canonicalUrl = canonicalPath
		? absoluteUrl(canonicalPath, options.origin)
		: null;
	const workspaceVessel = options.sourceVessel || VIRTUAL_OS_VESSEL;
	const verifiedLive = options.canonicalVerifiedLive === true;
	return {
		version: 2,
		aliasId: options.aliasId,
		projectId: project.id || null,
		siteId: site.id || null,
		rootPath,
		workspacePath,
		source: {
			workspaceVessel,
			canonicalVessel: DRIVE_VESSEL,
			nativeTunnelRequiredForWorkspace: workspaceVessel === NATIVE_TUNNEL_VESSEL,
			publication: options.sourcePublication || null
		},
		links: {
			canonicalPath,
			canonicalUrl,
			canonicalVerifiedLive: verifiedLive,
			osHomeUrl: OS_HOME_URL,
			codeHomeUrl: CODE_HOME_URL,
			workspaceDeepLink: null,
			workspaceDeepLinkVerified: false
		},
		settings: {
			siteSettingsPath: `${workspacePath}/.awtsmoos/site.json`,
			domainSettingsPath: `${workspacePath}/.awtsmoos/domain.json`
		},
		publication: {
			state: publication.state || 'unknown',
			readiness: site.readiness || null,
			projectTestimonyVersion: options.testimony?.version || null
		},
		domains: site.project?.domains || null,
		warnings: receiptWarnings(site, canonicalUrl, verifiedLive, options.sourcePublication)
	};
}

function joinWorkspacePath(aliasId, rootPath) {
	const alias = String(aliasId || '').replace(/^\/+|\/+$/g, '');
	const root = String(rootPath || '').replace(/^\/+|\/+$/g, '');
	return root ? `${alias}/${root}` : alias;
}

function absoluteUrl(pathname, origin = DEFAULT_ORIGIN) {
	const base = new URL(origin || DEFAULT_ORIGIN);
	if (!['http:', 'https:'].includes(base.protocol)) {
		throw new Error('SITE_PUBLIC_ORIGIN_INVALID');
	}
	return new URL(pathname, base.origin).toString();
}

function receiptWarnings(site, canonicalUrl, verifiedLive, sourcePublication) {
	const warnings = [];
	if (!sourcePublication || !sourcePublication.fileCount) {
		warnings.push('CANONICAL_SOURCE_NOT_PUBLISHED');
	}
	if (!canonicalUrl) {
		warnings.push('CANONICAL_ROUTE_UNAVAILABLE');
	} else if (!verifiedLive) {
		warnings.push('CANONICAL_URL_NOT_EXTERNALLY_VERIFIED');
	}
	if (!site.readiness?.ready) warnings.push('SOURCE_NOT_PUBLICATION_READY');
	warnings.push('WORKSPACE_DEEP_LINK_NOT_VERIFIED');
	return warnings;
}

module.exports = {
	buildSiteWorkspaceReceipt,
	DEFAULT_ORIGIN,
	OS_HOME_URL,
	CODE_HOME_URL,
	VIRTUAL_OS_VESSEL,
	NATIVE_TUNNEL_VESSEL,
	DRIVE_VESSEL
};
