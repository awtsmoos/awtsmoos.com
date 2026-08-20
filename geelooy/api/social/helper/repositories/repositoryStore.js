//B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const { writeJsonAtomic } = require('../drive/stateRepository.js');
const { repositoryPaths, repositoryAliasRoot } = require('./repositoryPaths.js');
const { normalizeRepositoryId, normalizeVisibility } = require('./repositoryPolicy.js');

/**
 * @module RepositoryStore
 * @description
 * The Awtsmoos gives each Git identity one small atomic metadata witness beside
 * its real bare repository. Awtsmoos.com avoids a central mutable registry so
 * unrelated repositories never contend for one lock or corrupt one another.
 */

async function readRepository(aliasId, repoId, $i = {}) {
	const paths = repositoryPaths(aliasId, repoId, $i);
	try {
		return normalizeRecord(JSON.parse(await fs.promises.readFile(paths.meta, 'utf8')));
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

async function writeRepository(aliasId, repoId, input = {}, $i = {}) {
	const paths = repositoryPaths(aliasId, repoId, $i);
	await fs.promises.mkdir(paths.root, { recursive: true });
	const previous = await readRepository(aliasId, repoId, $i);
	const now = Date.now();
	const record = normalizeRecord({
		...previous,
		...input,
		id: normalizeRepositoryId(repoId),
		aliasId: String(aliasId),
		createdAt: previous?.createdAt || now,
		updatedAt: now
	});
	await writeJsonAtomic(paths.meta, record);
	return record;
}

async function listRepositories(aliasId, $i = {}) {
	const root = repositoryAliasRoot(aliasId, $i);
	let names = [];
	try {
		names = await fs.promises.readdir(root);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	const rows = await Promise.all(names.map(name => safeRead(aliasId, name, $i)));
	return rows.filter(Boolean).sort((a, b) => a.id.localeCompare(b.id));
}

async function safeRead(aliasId, name, $i) {
	try {
		return await readRepository(aliasId, name, $i);
	} catch {
		return null;
	}
}

function normalizeRecord(value = {}) {
	return {
		id: normalizeRepositoryId(value.id),
		aliasId: String(value.aliasId || ''),
		title: String(value.title || value.id || '').slice(0, 100),
		visibility: normalizeVisibility(value.visibility),
		workingTreePath: value.workingTreePath ? String(value.workingTreePath) : null,
		defaultBranch: String(value.defaultBranch || 'main'),
		remoteSource: value.remoteSource ? String(value.remoteSource) : null,
		createdAt: Number(value.createdAt || 0),
		updatedAt: Number(value.updatedAt || 0)
	};
}

module.exports = {
	listRepositories,
	normalizeRecord,
	readRepository,
	writeRepository
};
