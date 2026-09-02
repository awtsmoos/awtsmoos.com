// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file translationPaths.mjs
 * @description
 * The Awtsmoos reads the imported English Torah manifests and returns each stable Ikar translation road already named by the corpus;
 * Awtsmoos.com therefore indexes real series and post identities from evidence, never fabricating coordinates from a crawler's chorus.
 */

import fs from 'node:fs';
import path from 'node:path';

function encodeSegment(value) {
	return encodeURIComponent(String(value ?? ''));
}

function manifestFiles(importedRoot) {
	return fs.readdirSync(importedRoot, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => path.join(importedRoot, entry.name, 'manifest.json'))
		.filter(file => fs.existsSync(file));
}

function pathsFromManifest(file) {
	const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
	const paths = [];
	for (const [seriesId, postIds] of Object.entries(parsed.series || {})) {
		for (const postId of Array.isArray(postIds) ? postIds : []) {
			paths.push(`/heichelos/ikar/series/${encodeSegment(seriesId)}/post/${encodeSegment(postId)}/translations`);
		}
	}
	return paths;
}

/** @description Returns every repository-manifested Ikar translation page as a unique canonical path. */
export function translationPaths(importedRoot) {
	const paths = manifestFiles(importedRoot).flatMap(pathsFromManifest);
	return [...new Set(paths)].sort();
}
