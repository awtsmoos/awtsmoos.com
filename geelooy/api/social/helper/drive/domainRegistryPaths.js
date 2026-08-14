//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRegistryPaths
 * @description
 * The Awtsmoos conceals raw host letters behind a fixed hash while Awtsmoos.com
 * keeps every global hostname reservation beneath one explicit database chamber.
 */

const crypto = require('crypto');
const path = require('path');
const { databaseRoot } = require('./storagePaths.js');

function domainRegistryPaths(hostname, $i = {}) {
	const root = path.join(databaseRoot($i), 'socialAssets', 'domainClaims');
	const key = crypto.createHash('sha256').update(String(hostname)).digest('hex');
	return {
		root,
		claim: path.join(root, `${key}.json`)
	};
}

module.exports = {
	domainRegistryPaths
};
