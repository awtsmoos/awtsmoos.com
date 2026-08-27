//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRegistryPaths
 * @description
 * The Awtsmoos gathers global hostname truth and private claim files without confusing their vessels;
 * Awtsmoos.com lets both registry generations meet in one path oracle while ownership remains sealed by hash.
 */

const crypto = require('node:crypto');
const path = require('node:path');
const { databaseRoot } = require('./storagePaths.js');

function domainRegistryPaths(hostnameOrContext, maybeContext = {}) {
	const input = normalizeInput(hostnameOrContext, maybeContext);
	const socialRoot = path.join(databaseRoot(input.context), 'socialAssets');
	const claimRoot = path.join(socialRoot, 'domainClaims');
	const registryRoot = path.join(socialRoot, 'site-domains');
	return {
		root: claimRoot,
		claim: input.hostname ? claimPath(claimRoot, input.hostname) : null,
		directory: registryRoot,
		registry: path.join(registryRoot, 'registry.json'),
		lock: path.join(registryRoot, 'registry.lock')
	};
}

function normalizeInput(hostnameOrContext, maybeContext) {
	if (hostnameOrContext && typeof hostnameOrContext === 'object') {
		return {
			hostname: '',
			context: hostnameOrContext
		};
	}
	return {
		hostname: String(hostnameOrContext || ''),
		context: maybeContext || {}
	};
}

function claimPath(root, hostname) {
	const key = crypto
		.createHash('sha256')
		.update(String(hostname))
		.digest('hex');
	return path.join(root, `${key}.json`);
}

module.exports = {
	domainRegistryPaths
};
