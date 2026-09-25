//B"H
// Boruch Hashem
// Blessed is He
/** Weighs expensive visual patterns without mistaking every use for a defect. */
import fs from 'node:fs';
import { trackedSourceFiles } from './trackedFiles.mjs';

const RULES = [
	['backdrop-filter', /backdrop-filter\s*:/g],
	['fixed-attachment', /background-attachment\s*:\s*fixed/g],
	['document-overflow-lock', /(?:html|body)[^{]*\{[^}]*overflow\s*:\s*hidden/gs],
	['transition-all', /transition\s*:\s*all\b/g]
];

export function scanPerformanceRisks() {
	const findings = [];
	for (const path of trackedSourceFiles(['.css'])) {
		if (!fs.existsSync(path)) continue;
		const source = fs.readFileSync(path, 'utf8');
		for (const [kind, pattern] of RULES) {
			const count = [...source.matchAll(pattern)].length;
			if (count) findings.push({ path, kind, count });
		}
	}
	return findings;
}
