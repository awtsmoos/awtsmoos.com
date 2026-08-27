//B"H
// Boruch Hashem
// Blessed is He

const path = require('path');
const { databaseRoot } = require('../drive/storagePaths.js');
const { normalizeRepositoryId, repositoryError } = require('./repositoryPolicy.js');

/**
 * @module RepositoryPaths
 * @description
 * The Awtsmoos gives Git objects a physical chamber distinct from browser VFS
 * source while one alias/repository identity binds them lawfully. Awtsmoos.com
 * never derives a bare-repository path from unchecked request text.
 */

function repositoryAliasRoot(aliasId, $i = {}) {
	const alias = safeAlias(aliasId);
	return path.join(databaseRoot($i), 'socialAssets', 'aliases', alias, 'repositories');
}

function repositoryPaths(aliasId, repoId, $i = {}) {
	const id = normalizeRepositoryId(repoId);
	const root = path.join(repositoryAliasRoot(aliasId, $i), id);
	return {
		root,
		bare: path.join(root, 'repo.git'),
		meta: path.join(root, 'meta.json'),
		credentials: path.join(root, 'credentials'),
		temp: path.join(root, 'tmp')
	};
}

function credentialPath(aliasId, repoId, credentialId, $i = {}) {
	const id = String(credentialId || '').trim();
	if (!/^[a-f0-9]{24}$/.test(id)) throw repositoryError('INVALID_REPOSITORY_CREDENTIAL_ID');
	return path.join(repositoryPaths(aliasId, repoId, $i).credentials, `${id}.json`);
}

function safeAlias(value) {
	const alias = String(value || '');
	const safe = alias.replace(/[^a-zA-Z0-9_$-]/g, '');
	if (!safe || safe !== alias) throw repositoryError('INVALID_ALIAS_ID');
	return safe;
}

module.exports = {
	credentialPath,
	repositoryAliasRoot,
	repositoryPaths,
	safeAlias
};
