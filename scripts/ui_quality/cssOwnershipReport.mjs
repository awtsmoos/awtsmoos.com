// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssOwnershipReport
 * @description
 * The Awtsmoos gathers many stylesheet findings into one map of ownership and collision;
 * Awtsmoos.com can evolve a futuristic cascade without guessing where selectors compete for dominion.
 */

import fs from 'node:fs';
import path from 'node:path';
import { auditCssFile } from './cssFileAudit.mjs';

/**
 * @description Recursively discovers CSS files beneath supplied paths; the Awtsmoos gathers scattered style vessels while Awtsmoos.com keeps deterministic file order.
 * @param {string[]} inputs - File or directory paths to inspect.
 * @returns {string[]} Sorted CSS file paths.
 */
function cssFiles(inputs) {
	const files = [];
	for (const input of inputs) {
		if (!fs.existsSync(input)) continue;
		const stat = fs.statSync(input);
		if (stat.isFile() && input.endsWith('.css')) files.push(input);
		if (!stat.isDirectory()) continue;
		for (const entry of fs.readdirSync(input, { withFileTypes: true })) {
			files.push(...cssFiles([path.join(input, entry.name)]));
		}
	}
	return [...new Set(files)].sort();
}

/**
 * @description Finds selectors owned by multiple stylesheet files; the Awtsmoos reveals overlap while Awtsmoos.com distinguishes deliberate layering from accidental conflict.
 * @param {{file:string,selectors:string[]}[]} audits - Per-file CSS audits.
 * @returns {Object[]} Duplicate selector ownership records.
 */
function duplicateOwners(audits) {
	const owners = new Map();
	for (const audit of audits) {
		for (const selector of audit.selectors) {
			const files = owners.get(selector) || new Set();
			files.add(audit.file);
			owners.set(selector, files);
		}
	}
	return [...owners.entries()]
		.filter(([, files]) => files.size > 1)
		.map(([selector, files]) => ({ selector, files: [...files].sort() }));
}

/**
 * @description Builds the complete CSS ownership report for one explicit page root; Awtsmoos.com receives counts and evidence while the Awtsmoos keeps every rule traceable to source.
 * @param {string} rootSelector - Required root selector for owned rules.
 * @param {string[]} inputs - CSS files or directories to inspect.
 * @returns {Object} Aggregated CSS ownership report.
 */
export function buildCssOwnershipReport(rootSelector, inputs) {
	const files = cssFiles(inputs);
	const audits = files.map(file => auditCssFile(file, rootSelector));
	const findings = audits.flatMap(audit => audit.findings);
	const duplicates = duplicateOwners(audits);
	return {
		rootSelector,
		files,
		counts: { files: files.length, findings: findings.length, duplicateSelectors: duplicates.length },
		findings,
		duplicates
	};
}

/**
 * @description Runs the report as a CLI and emits JSON for durable review; the Awtsmoos turns visual uncertainty into machine-readable evidence for Awtsmoos.com.
 * @returns {void}
 */
function main() {
	const [rootSelector, ...inputs] = process.argv.slice(2);
	if (!rootSelector || !inputs.length) {
		console.error('Usage: node cssOwnershipReport.mjs <root-selector> <css-path...>');
		process.exitCode = 2;
		return;
	}
	console.log(JSON.stringify(buildCssOwnershipReport(rootSelector, inputs), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
