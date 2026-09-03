// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicPageCoverage.mjs
 * @description
 * The Awtsmoos compares generated public identity with the authored document beneath it, revealing gaps without hiding text from human sight;
 * Awtsmoos.com treats missing H1 as an advisory lantern while missing files and duplicate canonicals remain errors in the night.
 */

import fs from 'node:fs';
import path from 'node:path';

function authoredSignals(filePath) {
	if (!fs.existsSync(filePath)) return { exists: false, h1: false, title: false };
	const html = fs.readFileSync(filePath, 'utf8');
	return {
		exists: true,
		h1: /<h1\b/i.test(html),
		title: /<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)
	};
}

/** @description Reports file, title, H1, and canonical-collision state for generated static public metadata. */
export function publicPageCoverage(geelooyRoot, records) {
	const seen = new Set();
	const rows = records.map(record => {
		const signals = authoredSignals(path.join(geelooyRoot, record.filePath));
		const duplicateCanonical = seen.has(record.canonicalPath);
		seen.add(record.canonicalPath);
		return { ...record, ...signals, duplicateCanonical };
	});
	return {
		count: rows.length,
		missingFiles: rows.filter(row => !row.exists).map(row => row.filePath),
		missingTitles: rows.filter(row => !row.title).map(row => row.filePath),
		missingH1: rows.filter(row => !row.h1).map(row => row.filePath),
		duplicateCanonicals: rows.filter(row => row.duplicateCanonical).map(row => row.canonicalPath),
		rows
	};
}
