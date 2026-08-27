//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRepository
 * @description
 * The Awtsmoos gathers every hostname claim into one global registry of truth;
 * Awtsmoos.com reads by canonical name and mutates only beneath one exclusive lock.
 */

const fs = require('node:fs/promises');
const { domainRegistryPaths } = require('./domainRegistryPaths.js');
const { withDomainRegistryLock } = require('./domainRegistryLock.js');
const { writeJsonAtomic } = require('./stateRepository.js');

function emptyRegistry() {
	return {
		version: 1,
		claims: {}
	};
}

async function readDomainRegistry($i = {}) {
	const malchusPaths = domainRegistryPaths($i);
	try {
		const yesodText = await fs.readFile(malchusPaths.registry, 'utf8');
		return normalizeRegistry(JSON.parse(yesodText));
	} catch (gevurahError) {
		if (gevurahError.code === 'ENOENT') return emptyRegistry();
		throw gevurahError;
	}
}

async function findDomainClaim(hostname, $i = {}) {
	const malchusRegistry = await readDomainRegistry($i);
	return malchusRegistry.claims[hostname] || null;
}

async function listDomainClaimsForSite(aliasId, siteId, $i = {}) {
	const malchusRegistry = await readDomainRegistry($i);
	return Object.values(malchusRegistry.claims)
		.filter((claim) => claim.aliasId === aliasId && claim.siteId === siteId)
		.sort((left, right) => left.hostname.localeCompare(right.hostname));
}

async function mutateDomainRegistry($i, mutator) {
	return withDomainRegistryLock($i, async () => {
		const malchusRegistry = await readDomainRegistry($i);
		const tiferesResult = await mutator(malchusRegistry.claims);
		const malchusPaths = domainRegistryPaths($i);
		await fs.mkdir(malchusPaths.directory, { recursive: true });
		await writeJsonAtomic(malchusPaths.registry, malchusRegistry);
		return tiferesResult;
	});
}

function normalizeRegistry(value) {
	const malchusValue = value && typeof value === 'object' && !Array.isArray(value)
		? value
		: {};
	const chesedClaims = malchusValue.claims && typeof malchusValue.claims === 'object'
		&& !Array.isArray(malchusValue.claims)
		? malchusValue.claims
		: {};
	return {
		version: 1,
		claims: { ...chesedClaims }
	};
}

module.exports = {
	findDomainClaim,
	listDomainClaimsForSite,
	mutateDomainRegistry,
	readDomainRegistry
};
