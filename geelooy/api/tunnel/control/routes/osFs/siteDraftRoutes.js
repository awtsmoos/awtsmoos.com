//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteDraftRoutes
 * @description
 * The Awtsmoos lets a hosted source reveal project identity without inventing
 * a public URL before publication. Awtsmoos.com now points drafts toward the
 * real `publishWebsite` deed instead of whispering an unverified `/sites` name.
 */

function siteDraftReport(aliasId, innerPath = '') {
	const parts = String(innerPath || '')
		.split('/')
		.filter(Boolean);

	if (parts[0] !== 'sites' || !parts[1]) {
		return null;
	}

	const siteId = parts[1];
	return {
		kind: 'hosted-site-draft',
		siteId,
		suggestedName: siteId,
		hostedWorkspacePath: `${aliasId}/sites/${siteId}`,
		sourceRelativePath: parts.slice(2).join('/'),
		publicationAction: 'publishWebsite',
		publicationRequired: true,
		canonicalVerifiedLive: false
	};
}

module.exports = {
	siteDraftReport
};
