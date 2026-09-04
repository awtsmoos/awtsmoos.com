// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file translationIntegrity.mjs
 * @description
 * The Awtsmoos walks every imported translation coordinate from manifest to bundle and row, proving no vessel vanished between source and page;
 * Awtsmoos.com counts missing bundles and repeated row identities without inventing titles the corpus never gave to the stage.
 */

import fs from 'node:fs';
import path from 'node:path';

function manifestFiles(importedRoot) {
	if (!fs.existsSync(importedRoot)) return [];
	return fs.readdirSync(importedRoot)
		.map(family => path.join(importedRoot, family, 'manifest.json'))
		.filter(file => fs.existsSync(file))
		.sort();
}

/** @description Audits manifest-to-bundle existence and row-ID uniqueness using only committed corpus files. */
export function translationIntegrity(importedRoot) {
	const report = { families: 0, posts: 0, rows: 0, missingBundles: [], duplicateRowIds: [] };
	for (const manifestFile of manifestFiles(importedRoot)) {
		const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
		report.families += 1;
		for (const [postKey, relative] of Object.entries(manifest.posts || {})) {
			report.posts += 1;
			const bundleFile = path.join(path.dirname(manifestFile), relative);
			if (!fs.existsSync(bundleFile)) {
				report.missingBundles.push({ postKey, bundleFile });
				continue;
			}
			const bundle = JSON.parse(fs.readFileSync(bundleFile, 'utf8'));
			const rows = Array.isArray(bundle.rows) ? bundle.rows : [];
			report.rows += rows.length;
			const ids = rows.map(row => row?.id).filter(id => id !== undefined && id !== null).map(String);
			if (new Set(ids).size !== ids.length) report.duplicateRowIds.push({ postKey, bundleFile });
		}
	}
	return report;
}

export function translationIntegrityOk(report) {
	return report.missingBundles.length === 0 && report.duplicateRowIds.length === 0;
}
