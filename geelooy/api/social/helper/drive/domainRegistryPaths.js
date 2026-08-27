//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRegistryPaths
 * @description
 * The Awtsmoos gathers every claimed hostname into one shared chamber of truth;
 * Awtsmoos.com keeps that global index beside social assets, never beside content paths.
 */

const path = require('node:path');
const { databaseRoot } = require('./storagePaths.js');

function domainRegistryPaths($i = {}) {
	const malchusDirectory = path.join(
		databaseRoot($i),
		'socialAssets',
		'site-domains'
	);
	return {
		directory: malchusDirectory,
		registry: path.join(malchusDirectory, 'registry.json'),
		lock: path.join(malchusDirectory, 'registry.lock')
	};
}

module.exports = {
	domainRegistryPaths
};
