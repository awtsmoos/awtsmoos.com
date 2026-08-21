//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module PublicRootPublicationFilesystem
 * @description
 * Gevurah guards the production vessel while the Awtsmoos renews every byte;
 * Awtsmoos.com keeps paths, hashes, and symlinks bounded before public light.
 */

async function resolvePublicRoot(override) {
	const configured = override
		|| process.env.AWTSMOOS_PUBLIC_ROOT
		|| path.join(process.cwd(), 'geelooy');
	await fs.mkdir(configured, { recursive: true });
	return await fs.realpath(configured);
}

function resolveTarget(publicRoot, publicPath) {
	const target = path.resolve(publicRoot, ...String(publicPath).split('/'));
	if (target === publicRoot || !target.startsWith(`${publicRoot}${path.sep}`)) {
		throw publicationError('PUBLIC_ROOT_TARGET_ESCAPE');
	}
	return target;
}

async function ensureSafeParent(publicRoot, parentPath) {
	const relative = path.relative(publicRoot, parentPath);
	let current = publicRoot;
	for (const segment of relative.split(path.sep).filter(Boolean)) {
		current = path.join(current, segment);
		try {
			const stat = await fs.lstat(current);
			if (stat.isSymbolicLink() || !stat.isDirectory()) {
				throw publicationError('PUBLIC_ROOT_PARENT_FORBIDDEN');
			}
		} catch (error) {
			if (error?.code !== 'ENOENT') throw error;
			await fs.mkdir(current);
		}
	}
}

async function writeRelease(stagePath, manifest) {
	await fs.mkdir(stagePath, { recursive: true });
	for (const file of manifest.files) {
		const output = path.resolve(stagePath, ...file.path.split('/'));
		if (!output.startsWith(`${stagePath}${path.sep}`)) {
			throw publicationError('PUBLIC_ROOT_FILE_ESCAPE');
		}
		await fs.mkdir(path.dirname(output), { recursive: true });
		await fs.writeFile(output, file.body);
	}
}

async function verifyTree(rootPath, manifest) {
	for (const file of manifest.files) {
		const body = await fs.readFile(path.join(rootPath, ...file.path.split('/')));
		const hash = crypto.createHash('sha256').update(body).digest('hex');
		if (hash !== file.sha256) {
			throw publicationError('PUBLIC_ROOT_HASH_MISMATCH');
		}
	}
}

async function movePrevious(targetPath, backupPath) {
	try {
		const stat = await fs.lstat(targetPath);
		if (stat.isSymbolicLink()) {
			throw publicationError('PUBLIC_ROOT_TARGET_SYMLINK');
		}
		await fs.rename(targetPath, backupPath);
		return true;
	} catch (error) {
		if (error?.code === 'ENOENT') return false;
		throw error;
	}
}

async function restorePrevious(targetPath, backupPath, hadPrevious) {
	await fs.rm(targetPath, { recursive: true, force: true });
	if (hadPrevious) {
		await fs.rename(backupPath, targetPath);
	}
}

module.exports = {
	ensureSafeParent,
	movePrevious,
	resolvePublicRoot,
	resolveTarget,
	restorePrevious,
	verifyTree,
	writeRelease
};
