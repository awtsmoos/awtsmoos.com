//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteMappingService
 * @description
 * The Awtsmoos lets many folder-worlds emerge from one alias while one remains
 * primary; Awtsmoos.com mutates the registry through the alias Drive lock.
 */

const { readDriveState, mutateDriveState } = require('./stateRepository.js');
const {
	normalizeSiteId,
	normalizeSiteRecord,
	normalizeSiteRegistry,
	implicitPrimarySite,
	siteMappingError
} = require('./siteMappingPolicy.js');

async function listSiteMappings(aliasId, $i) {
	return siteMappingsFromState(await readDriveState(aliasId, $i));
}

async function upsertSiteMapping(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		state.sites = normalizeSiteRegistry(state.sites);
		const siteId = normalizeSiteId(options.siteId);
		const previous = state.sites[siteId] || {};
		const record = normalizeSiteRecord(siteId, options.input, previous);
		if (!Object.keys(state.sites).length) record.primary = true;
		if (record.primary) clearPrimary(state.sites);
		state.sites[siteId] = record;
		ensurePrimary(state.sites);
		return state.sites[siteId];
	});
}

async function deleteSiteMapping(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		state.sites = normalizeSiteRegistry(state.sites);
		const siteId = normalizeSiteId(options.siteId);
		if (!state.sites[siteId]) throw siteMappingError('SITE_NOT_FOUND');
		delete state.sites[siteId];
		ensurePrimary(state.sites);
		return { deleted: true, siteId };
	});
}

function siteMappingsFromState(state) {
	const sites = Object.values(normalizeSiteRegistry(state?.sites));
	if (!sites.length) return [implicitPrimarySite()];
	return sites.sort((left, right) => left.id.localeCompare(right.id));
}

function publicSiteMappingsFromState(state) {
	return siteMappingsFromState(state).filter(site => site.enabled);
}

function primarySiteFromState(state) {
	const sites = publicSiteMappingsFromState(state);
	return sites.find(site => site.primary) || sites[0] || null;
}

function clearPrimary(sites) {
	for (const site of Object.values(sites)) site.primary = false;
}

function ensurePrimary(sites) {
	const values = Object.values(sites);
	if (!values.length || values.some(site => site.primary)) return;
	const preferred = values.find(site => site.enabled) || values[0];
	preferred.primary = true;
}

module.exports = {
	listSiteMappings,
	upsertSiteMapping,
	deleteSiteMapping,
	siteMappingsFromState,
	publicSiteMappingsFromState,
	primarySiteFromState
};
