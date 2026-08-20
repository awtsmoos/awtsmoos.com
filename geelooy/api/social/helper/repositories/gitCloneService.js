//B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const path = require('path');
const { sp } = require('../_awtsmoos.constants.js');
const { requireAliasOwner } = require('../drive/authorization.js');
const { dbPath, splitPath } = require('../../../tunnel/control/routes/osFs/path.js');
const { runGit } = require('./gitProcess.js');
const { validateGitRemote } = require('./gitRemotePolicy.js');
const { repositoryPaths } = require('./repositoryPaths.js');
const { normalizeRepositoryId, normalizeVisibility, repositoryError } = require('./repositoryPolicy.js');
const { writeRepository } = require('./repositoryStore.js');
const { readWorkingTree } = require('./virtualOsTree.js');

/**
 * @module GitCloneService
 * @description
 * The Awtsmoos lets one public HTTPS Git history enter Awtsmoos as both real
 * bare Git objects and an editable hosted Virtual OS tree. Awtsmoos.com writes
 * authoritative repository metadata only after both vessels exist successfully.
 */

async function cloneRepositoryToVirtualOs(options = {}) {
	const target = targetPath(options.targetPath, options.aliasId);
	await requireAliasOwner({ aliasId: target.aliasId, userid: options.actorUserId, $i: options.$i });
	const repoId = normalizeRepositoryId(options.repoId);
	const remote = await validateGitRemote(options.sourceUrl);
	const paths = repositoryPaths(target.aliasId, repoId, options.$i);
	if (await exists(paths.meta) || await exists(paths.bare)) throw repositoryError('REPOSITORY_ALREADY_EXISTS');
	await fs.promises.mkdir(paths.root, { recursive: true });
	try {
		await runGit(['clone', '--mirror', '--', remote, paths.bare], { timeoutMs: 300000 });
		const branch = await defaultBranch(paths.bare);
		const checkout = path.join(paths.temp, `checkout-${Date.now()}`);
		await fs.promises.mkdir(paths.temp, { recursive: true });
		await runGit(['clone', '--no-local', '--branch', branch, '--', paths.bare, checkout], { timeoutMs: 300000 });
		try {
			const tree = await readWorkingTree(checkout);
			await options.$i.db.write(dbPath(sp, target.aliasId, target.innerPath), tree);
		} finally {
			await fs.promises.rm(checkout, { recursive: true, force: true });
		}
		const repository = await writeRepository(target.aliasId, repoId, {
			title: options.title || repoId,
			visibility: normalizeVisibility(options.visibility),
			workingTreePath: target.innerPath,
			defaultBranch: branch,
			remoteSource: remote
		}, options.$i);
		return { repository, cloneUrl: canonicalCloneUrl(target.aliasId, repoId) };
	} catch (error) {
		await fs.promises.rm(paths.root, { recursive: true, force: true });
		throw error;
	}
}

function targetPath(value, expectedAlias) {
	const parsed = splitPath(value || '');
	if (parsed.root || !parsed.aliasId || !parsed.innerPath) throw repositoryError('GIT_TARGET_PATH_REQUIRED');
	if (expectedAlias && parsed.aliasId !== expectedAlias) throw repositoryError('GIT_TARGET_ALIAS_MISMATCH');
	return parsed;
}

async function defaultBranch(bare) {
	const result = await runGit(['--git-dir', bare, 'symbolic-ref', '--short', 'HEAD']);
	return String(result.stdout || 'main').trim().replace(/^refs\/heads\//, '') || 'main';
}

function canonicalCloneUrl(aliasId, repoId) {
	const origin = String(process.env.AWTSMOOS_PUBLIC_ORIGIN || 'https://awtsmoos.com').replace(/\/+$/, '');
	return `${origin}/git/${encodeURIComponent(aliasId)}/${encodeURIComponent(repoId)}.git`;
}

async function exists(file) {
	try { await fs.promises.access(file); return true; } catch { return false; }
}

module.exports = {
	canonicalCloneUrl,
	cloneRepositoryToVirtualOs,
	targetPath
};
