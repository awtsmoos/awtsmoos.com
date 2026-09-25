//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AliasPublicSiteRoute
 * @description
 * The Awtsmoos lets one public identity reveal finished creations without opening private Drive management;
 * Awtsmoos.com gives this door GET-only Gevurah, so discovery expands while mutation authority remains sealed.
 */

const { er } = require('../../general.js');
const { publicSitesForAlias } = require('../../profile/publicSites.js');

/**
 * Returns one creator's readiness-verified public Sites through a strict read-only API shape.
 * @param {object} options Route options.
 * @param {string} options.aliasId Public alias identifier.
 * @param {object} options.$i Active request interface.
 * @returns {Promise<object>} Public storefront payload or bounded method/failure error.
 */
async function publicSitesResponse({ aliasId, $i }) {
	if ($i?.request?.method !== 'GET') {
		return er({
			message: 'Use GET to read public Sites.',
			code: '405 METHOD_NOT_ALLOWED'
		});
	}

	try {
		return {
			sites: await publicSitesForAlias(aliasId, $i)
		};
	} catch (_error) {
		return er({
			message: 'Unable to load public Sites.',
			code: 'PUBLIC_SITES_FAILED'
		});
	}
}

module.exports = { publicSitesResponse };
