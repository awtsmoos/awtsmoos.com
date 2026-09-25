//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicCreatorSites
 * @description
 * The Awtsmoos lets a finished public world illuminate its creator without opening the private workshop behind it;
 * Awtsmoos.com reveals only live Site identity and distribution doors, so publication can compound into discovery and Remix.
 */

const { readDriveState } = require('../drive/stateRepository.js');
const { publicSiteMappingsFromState } = require('../drive/siteMappingService.js');
const { siteReadinessFromState } = require('../drive/siteReadiness.js');

const MAX_PUBLIC_SITES = 50;
const PUBLIC_ORIGIN = 'https://awtsmoos.com';

/**
 * Loads one alias's readiness-verified public Site storefront.
 * @param {string} aliasId Public creator identity.
 * @param {object} $i Awtsmoos request context used only by the Drive state repository.
 * @returns {Promise<Array<object>>} Strict presentation DTOs with no management state.
 */
async function publicSitesForAlias(aliasId, $i) {
	const state = await readDriveState(aliasId, $i);
	return publicSitesFromState(aliasId, state);
}

/**
 * Projects Drive state into a bounded, secret-free creator storefront.
 * @param {string} aliasId Public creator identity.
 * @param {object} state Normalized Drive state testimony.
 * @param {number} limit Maximum public records returned.
 * @returns {Array<object>} Ready Sites ordered deterministically by Site id.
 */
function publicSitesFromState(aliasId, state, limit = MAX_PUBLIC_SITES) {
	const boundedLimit = Math.max(0, Math.min(MAX_PUBLIC_SITES, Number(limit) || 0));
	return publicSiteMappingsFromState(state)
		.filter(site => siteReadinessFromState(state, site).ready === true)
		.slice(0, boundedLimit)
		.map(site => publicSiteRecord(aliasId, site));
}

/**
 * Creates the exact public contract. Never spread Site or readiness records here.
 * @param {string} aliasId Public creator identity.
 * @param {object} site Normalized ready Site mapping.
 * @returns {{id:string,title:string,publicUrl:string,remixUrl:string}} Safe public record.
 */
function publicSiteRecord(aliasId, site) {
	const aliasSegment = encodeURIComponent(String(aliasId || ''));
	const siteSegment = encodeURIComponent(String(site.id || ''));
	const publicUrl = `/sites/${aliasSegment}/${siteSegment}/`;
	const canonicalLive = `${PUBLIC_ORIGIN}${publicUrl}`;
	return Object.freeze({
		id: site.id,
		title: site.title,
		publicUrl,
		remixUrl: `/drive/?remix=${encodeURIComponent(canonicalLive)}`
	});
}

module.exports = {
	MAX_PUBLIC_SITES,
	publicSiteRecord,
	publicSitesForAlias,
	publicSitesFromState
};
