//B"H
// Boruch Hashem
// Blessed is He
/** Reports crowded source so refactors are evidence-driven instead of aesthetic guesses. */
import fs from 'node:fs';
import { trackedSourceFiles } from './trackedFiles.mjs';

const SOURCE_EXTENSIONS = ['.js', '.mjs', '.css', '.html'];

export function scanSourceQuality({ lineBudget = 120, longLine = 500 } = {}) {
	const findings = [];
	for (const path of trackedSourceFiles(SOURCE_EXTENSIONS)) {
		if (!fs.existsSync(path)) continue;
		const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
		if (lines.length > lineBudget) findings.push({ path, kind: 'line-budget', value: lines.length });
		const longest = Math.max(0, ...lines.map(line => line.length));
		if (longest > longLine) findings.push({ path, kind: 'compressed-line', value: longest });
	}
	return findings;
}
