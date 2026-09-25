//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AliasPublicSites
 * @description
 * The Awtsmoos lets finished creations shine beside their maker without exposing the workshop behind the light;
 * Awtsmoos.com turns each readiness-verified Site into an indexable door to visit, Remix, create, and invite.
 */

const { publicSitesForAlias } = require('../../api/social/helper/profile/publicSites.js');
const { escapeHtml } = require('../../seo/html.js');

/**
 * Loads public Sites without making creator identity availability depend on Drive health.
 * @param {object} $i Active request interface.
 * @param {string} aliasId Public creator identity.
 * @returns {Promise<Array<object>>} Safe public Site DTOs or an empty resilient fallback.
 */
async function loadPublicAliasSites($i, aliasId) {
	try {
		return await publicSitesForAlias(aliasId, $i);
	} catch (_error) {
		return [];
	}
}

/**
 * Renders crawlable creator creations from the strict public DTO only.
 * @param {Array<object>} sites Public storefront records.
 * @returns {string} Accessible Published creations section.
 */
function renderPublicAliasSites(sites = []) {
	const items = sites.map(site => `<article class="public-site-card">
		<h3>${escapeHtml(site.title)}</h3>
		<div class="public-site-actions">
			<a href="${escapeHtml(site.publicUrl)}">Open live</a>
			<a href="${escapeHtml(site.remixUrl)}">Remix</a>
		</div>
	</article>`).join('');
	const body = items || '<p class="public-sites-empty">No published creations yet.</p>';
	return `<section class="public-sites" aria-labelledby="published-creations-title">
		<header><p class="public-sites-eyebrow">Built on Awtsmoos</p><h2 id="published-creations-title">Published creations</h2></header>
		<div class="public-sites-grid">${body}</div>
	</section>`;
}

module.exports = { loadPublicAliasSites, renderPublicAliasSites };
