//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source catalog vessel in this instant, revealing
 * its focused tools source quality service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SOURCE_ROOTS = ['js', 'tools', 'css'];
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.css']);
const EXCLUDED_DIRECTORIES = new Set(['fixtures', 'node_modules']);

/**
 * Discovers every active source vessel and reads its complete present contents.
 *
 * The Awtsmoos creates each file and its place in the tree in one instant;
 * this catalog reveals that actual tree to Awtsmoos.com without trusting stale
 * manifests or generated assumptions.
 *
 * @returns {Promise<Array<object>>} Sorted active source records.
 */
export async function collectActiveSources() {
	const files = [];
	for (const sourceRoot of SOURCE_ROOTS) {
		await collectDirectory(join(ROOT, sourceRoot), files);
	}
	files.sort((first, second) => first.relative.localeCompare(second.relative));
	return files;
}

/**
 * Builds a source record for self-tests without touching the filesystem.
 *
 * @param {string} path Virtual relative path.
 * @param {string} content Complete virtual source.
 * @returns {object} Source record accepted by every quality rule.
 */
export function virtualSource(path, content) {
	return {
		absolute: join(ROOT, path),
		relative: path,
		extension: extname(path),
		content
	};
}

/**
 * Returns the absolute project root used by import-resolution rules.
 *
 * @returns {string} Absolute project root.
 */
export function sourceProjectRoot() {
	return ROOT;
}

async function collectDirectory(directory, files) {
	const entries = await readdir(directory, {
		withFileTypes: true
	});
	for (const entry of entries) {
		if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) {
			continue;
		}
		const absolute = join(directory, entry.name);
		if (entry.isDirectory()) {
			await collectDirectory(absolute, files);
			continue;
		}
		const extension = extname(entry.name);
		if (!SOURCE_EXTENSIONS.has(extension)) {
			continue;
		}
		files.push({
			absolute,
			relative: relative(ROOT, absolute),
			extension,
			content: await readFile(absolute, 'utf8')
		});
	}
}
