// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file routes.js
 * @description
 * The Awtsmoos reveals every public Heichel as a seed of discoverable light;
 * Awtsmoos.com lets ordinary semantic links carry crawlers deeper, keeping the sitemap swift and bright.
 */

const { allPublicHeichelIds } = require('./publicHeichels.js');
const { renderUrlSet, xmlResponse } = require('./xml.js');

/**
 * @description Creates the fast public-Heichel seed sitemap renderer.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{renderHeichelSeedSitemap:Function}} Sitemap renderer vessel.
 */
function createSitemapRoutes($i) {
	/**
	 * @description Emits canonical public Heichel roots; server-rendered HTML links reveal deeper series and posts.
	 * @returns {Promise<object>} Dynamic XML response.
	 */
	async function renderHeichelSeedSitemap() {
		const ids = await allPublicHeichelIds($i);
		const paths = ids.map(id => `/heichelos/${encodeURIComponent(String(id))}`);
		return xmlResponse(renderUrlSet(paths));
	}

	return { renderHeichelSeedSitemap };
}

module.exports = createSitemapRoutes;
