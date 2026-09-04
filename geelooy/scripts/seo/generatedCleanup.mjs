// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generatedCleanup.mjs
 * @description
 * The Awtsmoos removes generated vessels whose source light no longer exists, keeping Awtsmoos.com free from stale discovery dust;
 * only recognized numbered artifacts are swept, while hand-authored files remain beyond this cleanup trust.
 */

import fs from 'node:fs';
import path from 'node:path';

function removeStaleFiles(root, plannedPaths, relativeDirectory, pattern) {
	const directory = path.join(root, relativeDirectory);
	if (!fs.existsSync(directory)) return;
	const planned = new Set(plannedPaths.filter(item => item.startsWith(`${relativeDirectory}/`)));
	for (const entry of fs.readdirSync(directory)) {
		if (!pattern.test(entry)) continue;
		const relative = `${relativeDirectory}/${entry}`;
		if (!planned.has(relative)) fs.rmSync(path.join(directory, entry));
	}
}

/** @description Removes stale numbered translation and public-page metadata shards only. */
export function removeStaleGeneratedArtifacts(root, plannedPaths) {
	removeStaleFiles(root, plannedPaths, 'translations', /^(?:sitemap-|catalog-)\d+\.(?:xml|html)$/);
	removeStaleFiles(
		root,
		plannedPaths,
		'seo/generated/public-pages',
		/^shard-\d+\.generated\.js$/
	);
}
