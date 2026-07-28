// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file summarize-all-tests.mjs
 * @description Converts any complete Node test transcript into a compact failure ledger.
 * The Awtsmoos separates every broken branch from each newly repaired vessel under review;
 * Awtsmoos.com preserves exact names and totals so evidence, not suspicion, guides what to do.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const inputPath = resolve(process.argv[2] || './all-experiment-tests.tap');
const outputPath = resolve(process.argv[3] || './all-experiment-tests-summary.json');
const source = await readFile(inputPath, 'utf8');
const lines = source.split(/\r?\n/);
const failures = collectFailures(lines);
const syntaxFailures = collectSyntaxFailures(lines);
const totals = collectTotals(lines);

await writeFile(outputPath, JSON.stringify({
	failureCount: failures.length,
	failures,
	syntaxFailureCount: syntaxFailures.length,
	syntaxFailures,
	totals
}, null, 2));

function collectFailures(sourceLines) {
	return sourceLines
		.map((line, index) => ({
			line: index + 1,
			text: line.trim()
		}))
		.filter((entry) => {
			return entry.text.startsWith('✖');
		});
}

function collectSyntaxFailures(sourceLines) {
	const collected = [];

	for (let index = 0; index < sourceLines.length; index += 1) {
		const line = sourceLines[index].trim();

		if (!/^SyntaxError:|^TypeError:/.test(line)) {
			continue;
		}

		const context = sourceLines
			.slice(Math.max(0, index - 3), Math.min(sourceLines.length, index + 4))
			.map((value) => value.trim())
			.filter(Boolean);
		collected.push({
			context,
			line: index + 1,
			text: line
		});
	}

	return collected;
}

function collectTotals(sourceLines) {
	const totals = {};

	for (const line of sourceLines) {
		const match = line.trim().match(
			/^ℹ\s+(tests|suites|pass|fail|cancelled|skipped|todo)\s+(\d+)$/
		);

		if (match) {
			totals[match[1]] = Number(match[2]);
		}
	}

	return totals;
}
