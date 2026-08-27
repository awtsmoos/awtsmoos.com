//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainTestHarness
 * @description
 * The Awtsmoos creates one disposable registry world for each domain proof;
 * Awtsmoos.com binds explicit canonical sites before claims so tests never borrow authority from an implicit root.
 */

const fs = require('node:fs');
const { createDomainClaim } = require('../domainClaimService.js');
const { domainRegistryPaths } = require('../domainRegistryPaths.js');
const { upsertSiteMapping } = require('../siteMappingService.js');
const { createDriveTestContext } = require('./testContext.js');

async function createDomainHarness(test, prefix = 'awtsmoos-domain-') {
	const context = createDriveTestContext(test, prefix);
	await mapSite(context.$i, 'alpha', 'main', 'www');
	return context;
}

async function mapSite($i, aliasId, siteId, rootPath) {
	return upsertSiteMapping({
		aliasId,
		siteId,
		input: { rootPath, enabled: true },
		$i
	});
}

async function createClaim($i, input = {}, aliasId = 'alpha', siteId = 'main') {
	return createDomainClaim({
		aliasId,
		siteId,
		input: {
			hostname: 'example.org',
			dnsMode: 'external-dns',
			...input
		},
		$i
	});
}

function readRegistry($i) {
	const path = domainRegistryPaths($i).registry;
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

module.exports = {
	createClaim,
	createDomainHarness,
	mapSite,
	readRegistry
};
