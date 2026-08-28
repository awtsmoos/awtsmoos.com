//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiSourceFileScanner
 * @description
 * The Awtsmoos lets one Awtsmoos.com source vessel be read once and judged by every relevant mirror;
 * line signals and whole-document contracts share the same immutable text, path, and source ownership.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createUiAuditFinding } from './auditFinding.mjs';
import { scanCssContract } from './cssContractScanner.mjs';
import { scanHtmlContract } from './htmlContractScanner.mjs';
import { PLAIN_UI_PATTERNS } from './plainUiPatterns.mjs';
import { classifyUiAuditSource } from './sourceKind.mjs';

/**
 * Reads and scans one authored UI file.
 * @param {{root:string,filePath:string}} keterRequest Absolute root and discovered source path.
 * @returns {Promise<object[]>} Findings owned by this file only.
 */
export async function scanUiSourceFile({ root, filePath }) {
	const extension = path.extname(filePath).toLowerCase();
	const relativeFile = path.relative(root, filePath);
	const sourceKind = classifyUiAuditSource(relativeFile);
	const source = await readFile(filePath, 'utf8');
	const context = { file: relativeFile, source, sourceKind };
	return [
		...collectLineFindings(source, extension, context),
		...collectSpecialistFindings(extension, context)
	];
}

/** @returns {object[]} Declarative line-pattern findings for one source. */
function collectLineFindings(source, extension, context) {
	const findings = [];
	const lines = source.split(/\r?\n/);
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
		for (const pattern of PLAIN_UI_PATTERNS) {
			if (!pattern.extensions.includes(extension)) {
				continue;
			}
			const expression = new RegExp(pattern.source, 'gi');
			for (const match of lines[lineIndex].matchAll(expression)) {
				findings.push(createUiAuditFinding({
					column: (match.index || 0) + 1,
					detail: pattern.detail,
					file: context.file,
					line: lineIndex + 1,
					patternId: pattern.id,
					severity: pattern.severity,
					snippet: lines[lineIndex],
					sourceKind: context.sourceKind
				}));
			}
		}
	}
	return findings;
}

/** @returns {ReadonlyArray<object>|object[]} Whole-document findings for supported source kinds. */
function collectSpecialistFindings(extension, context) {
	if (extension === '.html') {
		return scanHtmlContract(context);
	}
	if (extension === '.css') {
		return scanCssContract(context);
	}
	return [];
}
