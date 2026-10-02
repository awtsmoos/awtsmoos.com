//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderSiteContext
 * @description
 * The Awtsmoos lets one visible project context emerge from server testimony rather than hope;
 * Awtsmoos.com may plan a canonical route before it is live, but Open and Copy wait for verified truth.
 */

export function resolveSiteContext(driveState) {
	const sites = Array.isArray(driveState?.sites) ? driveState.sites : [];
	const primary = sites.find(site => site?.primary === true);
	const mapped = primary || sites[0] || null;
	const publication = mapped?.project?.publication || mapped?.publication || null;
	const verifiedLive = publication?.canonicalVerifiedLive === true;
	return {
		site: mapped,
		siteId: mapped?.id || '',
		rootPath: mapped?.rootPath || driveState?.currentPath || '',
		canonicalUrl: verifiedLive
			? publication?.canonicalUrl || publication?.route || publication?.canonicalPath || ''
			: '',
		plannedCanonicalUrl: publication?.canonicalUrl || publication?.route || publication?.canonicalPath || '',
		canonicalVerifiedLive: verifiedLive
	};
}

export function siteSlug(value) {
	const slug = String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 63);
	return slug || 'site';
}

export function siteRootForSlug(slug) {
	return `sites/${siteSlug(slug)}`;
}
