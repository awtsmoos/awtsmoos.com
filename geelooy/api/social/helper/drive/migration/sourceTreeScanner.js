//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationSourceTreeScanner
 * @description
 * The Awtsmoos reveals each nested name in stable order, while Awtsmoos.com
 * refuses symlinks and strange nodes that could tunnel beyond the declared tree.
 */

const fs = require('node:fs/promises');
const path = require('node:path');
const {
	normalizeSourceRelativePath,
	resolveSourcePath,
	sourcePathError
} = require('./sourcePathPolicy.js');

async function scanSourceTree(sourceRoot) {
	const root = path.resolve(String(sourceRoot || ''));
	const rootStat = await fs.lstat(root);
	assertDirectory(rootStat, '');
	const files = [];
	await scanDirectory(root, '', files);
	return files;
}

async function scanDirectory(root, relativeDirectory, files) {
	const absoluteDirectory = relativeDirectory
		? resolveSourcePath(root, relativeDirectory)
		: root;
	const names = await readSortedNames(absoluteDirectory);
	for (const name of names) {
		const relativePath = normalizeSourceRelativePath(
			relativeDirectory ? `${relativeDirectory}/${name}` : name
		);
		const absolutePath = resolveSourcePath(root, relativePath);
		const stat = await fs.lstat(absolutePath);
		if (stat.isSymbolicLink()) throw nodeError('SOURCE_SYMLINK_REJECTED', relativePath);
		if (stat.isDirectory()) {
			await scanDirectory(root, relativePath, files);
			continue;
		}
		if (!stat.isFile()) throw nodeError('SOURCE_NODE_UNSUPPORTED', relativePath);
		files.push({ sourceRelativePath: relativePath, size: safeSize(stat.size) });
	}
}

async function readSortedNames(absoluteDirectory) {
	const directory = await fs.opendir(absoluteDirectory);
	const names = [];
	try {
		for await (const entry of directory) names.push(entry.name);
	} finally {
		await directory.close().catch(error => {
			if (error.code !== 'ERR_DIR_CLOSED') throw error;
		});
	}
	return names.sort(compareCodePoints);
}

function compareCodePoints(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

function assertDirectory(stat, relativePath) {
	if (stat.isSymbolicLink()) throw nodeError('SOURCE_SYMLINK_REJECTED', relativePath);
	if (!stat.isDirectory()) throw sourcePathError('SOURCE_ROOT_NOT_DIRECTORY');
}

function safeSize(value) {
	const size = Number(value);
	if (!Number.isSafeInteger(size) || size < 0) {
		throw sourcePathError('SOURCE_FILE_SIZE_INVALID');
	}
	return size;
}

function nodeError(code, sourceRelativePath) {
	return sourcePathError(code, { sourceRelativePath });
}

module.exports = {
	scanSourceTree,
	readSortedNames,
	compareCodePoints
};
