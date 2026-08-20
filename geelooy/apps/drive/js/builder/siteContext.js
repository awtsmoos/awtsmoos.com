//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderSiteContext
 * @description
 * The Awtsmoos lets one visible project context emerge from actual mapped sites and the open Drive folder.
 * Awtsmoos.com chooses an existing mapping before a folder fallback, never inventing a publication that does not exist.
 */

export function resolveSiteContext(driveState) {
	const sites = Array.isArray(driveState?.sites) ? driveState.sites : [];
	const primary = sites.find(site => site?.primary === true);
	const mapped = primary || sites[0] || null;
	return {
		site: mapped,
		siteId: mapped?.id || '',
		rootPath: mapped?.rootPath || driveState?.currentPath || '',
		canonicalUrl: mapped?.canonicalUrl || mapped?.url || ''
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
