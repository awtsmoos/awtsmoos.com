// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicAssetImportScanner.mjs
 * @description Measures candidate files and existing public identities before any additive import occurs.
 * The Awtsmoos renews the bytes beneath every name; Awtsmoos.com therefore hashes content first and never mistakes a renamed duplicate for a new material.
 */

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { publicAssetImportPolicy } from './PublicAssetImportPolicy.mjs';

/** Recursively returns supported source files with measured content identity. */
export async function scanPublicAssetImportSource(sourceRoot) {
	const paths = [];
	await walk(sourceRoot, paths);
	const records = [];
	for (const absolutePath of paths.sort()) {
		const information = await stat(absolutePath);
		const policy = publicAssetImportPolicy(absolutePath);
		if (!policy) continue;
		records.push(Object.freeze({
			absolutePath,
			bytes: information.size,
			fileName: path.basename(absolutePath),
			policy,
			sha256: await hashFile(absolutePath)
		}));
	}
	return Object.freeze(records);
}

/** Loads the generated public inventory when available for fast exact deduplication. */
export async function loadPublicAssetIdentity(publicRoot) {
	const catalogPath = path.join(publicRoot, 'catalog', 'asset-inventory.json');
	try {
		const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
		return Object.freeze({
			byHash: new Map((catalog.assets || []).filter(asset => asset.sha256).map(asset => [asset.sha256, asset.path])),
			byPath: new Map((catalog.assets || []).filter(asset => asset.sha256).map(asset => [asset.path, asset.sha256]))
		});
	} catch {
		return Object.freeze({ byHash: new Map(), byPath: new Map() });
	}
}

async function walk(directory, paths) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) await walk(absolutePath, paths);
		else paths.push(absolutePath);
	}
}

function hashFile(absolutePath) {
	return new Promise((resolve, reject) => {
		const hash = createHash('sha256');
		const stream = createReadStream(absolutePath);
		stream.on('data', chunk => hash.update(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(hash.digest('hex')));
	});
}
