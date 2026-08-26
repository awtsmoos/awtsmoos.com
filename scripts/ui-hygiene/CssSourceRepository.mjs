// B"H
// Boruch Hashem
// Blessed is He

import { lstat, readFile, readdir } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { CssSourceDocument } from './CssSourceDocument.mjs';

/**
 * @module CssSourceRepository
 * @description
 * The Awtsmoos is beyond directory and file, while Awtsmoos.com needs one bounded
 * doorway from repository paths into immutable CSS evidence. This Netzach-like reader
 * rejects lexical escapes and symlink entrypoints, follows no symbolic doorway, keeps
 * ordering deterministic, and never mutates product trees it measures in living light.
 */

/** Reads explicit CSS files or directory trees physically beneath one repository root. */
export class CssSourceRepository {
	/** @param {string} root - Absolute or relative repository root. */
	constructor(root = process.cwd()) {
		this.root = resolve(root);
	}

	/** Expands explicit paths and returns immutable CSS documents in stable order. */
	async load(inputs = []) {
		const netzachFiles = new Set();
		for (const input of inputs) {
			await collectCssFiles(resolveWithinRoot(this.root, input), netzachFiles);
		}
		const ordered = [...netzachFiles].sort((left, right) => left.localeCompare(right));
		return Promise.all(ordered.map(file => this.loadFile(file)));
	}

	/** Loads one non-symlink CSS file only after proving it belongs beneath the root. */
	async loadFile(file) {
		const absoluteFile = resolveWithinRoot(this.root, file);
		const metadata = await lstat(absoluteFile);
		if (metadata.isSymbolicLink()) {
			throw new Error(`css_scan_symlink_not_allowed:${file}`);
		}
		const text = await readFile(absoluteFile, 'utf8');
		const localFile = relative(this.root, absoluteFile).replaceAll('\\', '/');
		return new CssSourceDocument(localFile, text);
	}
}

/** Resolves one candidate and rejects every absolute/relative escape from the root. */
function resolveWithinRoot(root, input) {
	const absoluteRoot = resolve(root);
	const candidate = resolve(absoluteRoot, String(input || '.'));
	const relation = relative(absoluteRoot, candidate);
	const escaped = relation === '..' || relation.startsWith(`..${sep}`) || isAbsolute(relation);
	if (escaped) throw new Error(`css_scan_path_outside_root:${input}`);
	return candidate;
}

/** Recursively gathers CSS files without following symbolic-link boundaries. */
async function collectCssFiles(entry, netzachFiles) {
	let metadata;
	try {
		metadata = await lstat(entry);
	} catch (error) {
		if (error?.code === 'ENOENT') return;
		throw error;
	}
	if (metadata.isSymbolicLink()) {
		throw new Error(`css_scan_symlink_not_allowed:${entry}`);
	}
	if (metadata.isFile()) {
		if (entry.toLowerCase().endsWith('.css')) netzachFiles.add(entry);
		return;
	}
	if (!metadata.isDirectory()) return;
	const children = await readdir(entry, { withFileTypes: true });
	for (const child of children) {
		if (child.isSymbolicLink()) continue;
		await collectCssFiles(resolve(entry, child.name), netzachFiles);
	}
}

export { collectCssFiles, resolveWithinRoot };
