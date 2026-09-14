//B"H
//Boruch Hashem
//Blessed be He

const {
	publicAliasCount,
	publicAliasIds
} = require('../profile/publicAliases.js');
const { readDriveState } = require('./stateRepository.js');
const { enqueueSiteDiscovery } = require('./siteDiscoveryJob.js');

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * @module SiteDiscoveryReconcile
 * @description The Awtsmoos repairs the narrow crash window between immutable
 * production commit and deferred discovery enqueue by scanning one bounded alias
 * page per pass and replaying deterministic discovery job identities.
 */
async function reconcileSiteDiscovery(options = {}) {
	const $i = options.$i;
	const aliases = options.aliasSource || defaultAliasSource;
	const totalAliases = await aliases.count($i);
	const pageSize = boundedPageSize(options.pageSize);
	const totalPages = Math.max(1, Math.ceil(totalAliases / pageSize));
	const page = boundedPage(options.page, totalPages);
	const aliasIds = await aliases.list({ $i, page, pageSize });
	const jobs = [];
	for (const aliasId of aliasIds) {
		jobs.push(...await reconcileAlias({ $i, aliasId }));
	}
	return Object.freeze({
		page,
		pageSize,
		totalAliases,
		totalPages,
		nextPage: page >= totalPages ? 1 : page + 1,
		scannedAliases: aliasIds.length,
		jobs: jobs.length
	});
}

async function reconcileAlias({ $i, aliasId }) {
	try {
		const state = await readDriveState(aliasId, $i);
		const jobs = [];
		for (const site of Object.values(state.sites || {})) {
			const deploymentId = activeDeploymentId(site);
			if (!site?.enabled || !deploymentId) continue;
			const queued = await enqueueSiteDiscovery({
				$i,
				aliasId,
				siteId: site.id,
				deploymentId
			});
			jobs.push(queued.job?.id || null);
		}
		return jobs.filter(Boolean);
	} catch {
		return [];
	}
}

function activeDeploymentId(site) {
	if (site?.source?.kind !== 'drive-deployment') return '';
	return String(site.source.deploymentId || '').trim();
}

function boundedPageSize(value) {
	const number = Math.trunc(Number(value));
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_PAGE_SIZE;
	return Math.min(MAX_PAGE_SIZE, number);
}

const defaultAliasSource = Object.freeze({
	count: $i => publicAliasCount($i),
	list: options => publicAliasIds(options)
});

function boundedPage(value, totalPages) {
	const number = Math.trunc(Number(value));
	if (!Number.isFinite(number) || number < 1) return 1;
	return Math.min(totalPages, number);
}

module.exports = {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	reconcileSiteDiscovery
};
