//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicProfileSites
 * @description
 * The Awtsmoos carries a visitor from one creator's finished work into another act of creation;
 * Awtsmoos.com keeps the browser storefront inert and text-safe while Open live and Remix strengthen the public flywheel.
 */

const root = document.getElementById('published-creations-root');
const aliasId = document.body.dataset.aliasId || aliasFromPath();

if (root && aliasId) {
	revealPublishedCreations(root, aliasId);
}

/** @returns {string} Alias segment from the canonical /@/alias public-profile path. */
function aliasFromPath() {
	const parts = location.pathname.split('/').filter(Boolean);
	const marker = parts.indexOf('@');
	return marker >= 0 ? decodeURIComponent(parts[marker + 1] || '') : '';
}

/**
 * Fetches the strict public DTO and updates the independent storefront root.
 * Existing SSR content remains intact if the network fails.
 * @param {HTMLElement} target Independent public storefront root.
 * @param {string} alias Public creator identifier.
 */
async function revealPublishedCreations(target, alias) {
	try {
		const response = await fetch(`/api/social/aliases/${encodeURIComponent(alias)}/sites`, {
			headers: { Accept: 'application/json' }
		});
		if (!response.ok) return;
		const payload = await response.json();
		if (!Array.isArray(payload?.sites)) return;
		target.replaceChildren(buildSection(payload.sites));
	} catch (_error) {
		// SSR or the existing empty state remains truthful when the API is unavailable.
	}
}

/** @param {Array<object>} sites Strict public Site DTOs. @returns {HTMLElement} Accessible storefront section. */
function buildSection(sites) {
	const section = document.createElement('section');
	section.className = 'public-sites';
	section.setAttribute('aria-labelledby', 'published-creations-title');
	const header = document.createElement('header');
	const eyebrow = document.createElement('p');
	eyebrow.className = 'public-sites-eyebrow';
	eyebrow.textContent = 'Built on Awtsmoos';
	const title = document.createElement('h2');
	title.id = 'published-creations-title';
	title.textContent = 'Published creations';
	header.append(eyebrow, title);
	const grid = document.createElement('div');
	grid.className = 'public-sites-grid';
	if (!sites.length) grid.append(emptyState());
	for (const site of sites) grid.append(siteCard(site));
	section.append(header, grid);
	return section;
}

/** @returns {HTMLElement} Truthful public empty state. */
function emptyState() {
	const message = document.createElement('p');
	message.className = 'public-sites-empty';
	message.textContent = 'No published creations yet.';
	return message;
}

/** @param {object} site Strict Site DTO. @returns {HTMLElement} Safe live/remix card. */
function siteCard(site) {
	const card = document.createElement('article');
	card.className = 'public-site-card';
	const title = document.createElement('h3');
	title.textContent = String(site?.title || site?.id || 'Published creation');
	const actions = document.createElement('div');
	actions.className = 'public-site-actions';
	for (const [label, href, prefix] of [
		['Open live', site?.publicUrl, '/sites/'],
		['Remix', site?.remixUrl, '/drive/?remix=']
	]) {
		if (typeof href !== 'string' || !href.startsWith(prefix)) continue;
		const link = document.createElement('a');
		link.href = href;
		link.textContent = label;
		actions.append(link);
	}
	card.append(title, actions);
	return card;
}
