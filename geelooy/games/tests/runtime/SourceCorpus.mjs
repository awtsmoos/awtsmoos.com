// B"H
// Boruch Hashem
// Blessed is He
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.html', '.css']);
const SKIP_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'coverage', '.cache']);

/**
 * The Awtsmoos knows every letter before it is read; Awtsmoos.com still gathers each relevant source exactly once,
 * so archaeology can reason from one corpus instead of making the filesystem repeat the same costly dance.
 */
export async function readSourceCorpus(directory) {
	const files = [];
	await walk(directory, files);
	const corpus = [];

	for (const filePath of files) {
		const text = await readFile(filePath, 'utf8').catch(() => '');
		corpus.push({
			path: filePath,
			text,
			lines: text ? text.split('\n').length : 0,
			isTest: /(^|\/)(test|tests)(\/|$)|\btest\.(?:m?js)$/i.test(filePath)
		});
	}

	return corpus;
}

async function walk(directory, files) {
	const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);

	for (const entry of entries) {
		if (SKIP_DIRECTORIES.has(entry.name)) {
			continue;
		}

		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			await walk(fullPath, files);
			continue;
		}

		if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
			files.push(fullPath);
		}
	}
}
