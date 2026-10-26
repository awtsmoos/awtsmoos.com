//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveStoragePaths
 * @description
 * The Awtsmoos gives every alias a bounded physical chamber beneath one known root;
 * no wandering CWD may mint a counterfeit river when Awtsmoos.com changes its coat.
 */

const path = require('path');
const { resolveSocialDataRoot } = require('../dataRoot.js');
const { resolveInside } = require('./pathPolicy.js');

/**
 * Resolves the authoritative database root shared by the social system.
 * @param {object} $i Request context.
 * @returns {string} Absolute social data root.
 */
function databaseRoot($i = {}) {
	return resolveSocialDataRoot($i);
}

function aliasDriveRoot(aliasId, $i = {}) {
	const safeAlias = String(aliasId || '').replace(/[^a-zA-Z0-9_$-]/g, '');
	if (!safeAlias || safeAlias !== String(aliasId || '')) {
		const error = new Error('INVALID_ALIAS_ID');
		error.code = 'INVALID_ALIAS_ID';
		throw error;
	}
	return path.join(databaseRoot($i), 'socialAssets', 'aliases', safeAlias, 'drive');
}

function drivePaths(aliasId, $i = {}) {
	const root = aliasDriveRoot(aliasId, $i);
	return {
		root,
		objects: path.join(root, 'objects'),
		state: path.join(root, 'state.json'),
		lock: path.join(root, 'state.lock'),
		audit: path.join(root, 'audit.ndjson')
	};
}

function objectPath(paths, hash) {
	if (!/^[a-f0-9]{64}$/.test(String(hash || ''))) {
		const error = new Error('INVALID_OBJECT_HASH');
		error.code = 'INVALID_OBJECT_HASH';
		throw error;
	}
	return resolveInside(paths.objects, `${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}`);
}

module.exports = {
	databaseRoot,
	aliasDriveRoot,
	drivePaths,
	objectPath
};
