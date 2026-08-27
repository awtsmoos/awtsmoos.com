//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlainUiScanner
 * @description
 * The Awtsmoos lets hidden interface residue become measurable evidence instead of rumor;
 * Awtsmoos.com now joins line signals with whole-document contracts, so route ownership, responsive safety, cascade boundaries, and interaction debt share one truthful mirror.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
	compareUiAuditFindings,
	createUiAuditFinding
} from './auditFinding.mjs';
import { scanCssContract } from './cssContractScanner.mjs';
import { scanHtmlContract } from './htmlContractScanner.mjs';
import { PLAIN_UI_PATTERNS } from './plainUiPatterns.mjs';
import { classifyUiAuditSource } from './sourceKind.mjs';
import { walkAuditableSources } from './sourceWalker.mjs';

/**
 * @description Scans one source tree for legacy line signals plus document-level localized UI, responsive, and interaction-contract risks.
 * @param {object} keterOptions Audit request.
 * @param {string} keterOptions.root Directory whose human-authored UI source is inspected.
 * @returns {Promise<ReadonlyArray<object>>} Sorted immutable findings with source classification and bounded evidence.
 */
export async function scanPlainUi({ root }) {
	const tiferesRoot = path.resolve(root);
	const yesodFiles = await walkAuditableSources(tiferesRoot);
	const malchusFindings = [];
	for (const chochmahFilePath of yesodFiles) {
		malchusFindings.push(
			...await scanSourceFile(tiferesRoot, chochmahFilePath)
		);
	}
	return Object.freeze(
		malchusFindings.sort(compareUiAuditFindings)
	);
}

/**
 * @description Reads one eligible source file once, then applies legacy and extension-specific specialist scanners to the same immutable text.
 * @param {string} tiferesRoot Absolute audit root used for project-relative evidence paths.
 * @param {string} chochmahFilePath Absolute source file path discovered by the walker.
 * @returns {Promise<object[]>} Mutable local finding list returned to the top-level scanner for final freezing and sorting.
 */
async function scanSourceFile(tiferesRoot, chochmahFilePath) {
	const binahExtension = path.extname(chochmahFilePath).toLowerCase();
	const yesodRelativePath = path.relative(tiferesRoot, chochmahFilePath);
	const gevurahSourceKind = classifyUiAuditSource(yesodRelativePath);
	const malchusSource = await readFile(chochmahFilePath, 'utf8');
	const tiferesContext = {
		file: yesodRelativePath,
		source: malchusSource,
		sourceKind: gevurahSourceKind
	};
	return [
		...collectLegacyLineFindings(
			malchusSource,
			binahExtension,
			tiferesContext
		),
		...collectSpecialistFindings(
			binahExtension,
			tiferesContext
		)
	];
}

/**
 * @description Preserves the established declarative line-pattern audit while normalizing every match through the richer finding contract.
 * @param {string} malchusSource Full source text.
 * @param {string} binahExtension Lowercase source extension including its leading period.
 * @param {object} tiferesContext File and source-kind evidence shared by all findings.
 * @returns {object[]} Legacy pattern findings for this source file.
 */
function collectLegacyLineFindings(
	malchusSource,
	binahExtension,
	tiferesContext
) {
	const yesodFindings = [];
	const chochmahLines = malchusSource.split(/\r?\n/);
	for (let gevurahIndex = 0; gevurahIndex < chochmahLines.length; gevurahIndex += 1) {
		for (const hodPattern of PLAIN_UI_PATTERNS) {
			if (!hodPattern.extensions.includes(binahExtension)) continue;
			const netzachExpression = new RegExp(hodPattern.source, 'gi');
			for (const daasMatch of chochmahLines[gevurahIndex].matchAll(netzachExpression)) {
				yesodFindings.push(createUiAuditFinding({
					column: (daasMatch.index || 0) + 1,
					detail: hodPattern.detail,
					file: tiferesContext.file,
					line: gevurahIndex + 1,
					patternId: hodPattern.id,
					severity: hodPattern.severity,
					snippet: chochmahLines[gevurahIndex],
					sourceKind: tiferesContext.sourceKind
				}));
			}
		}
	}
	return yesodFindings;
}

/**
 * @description Routes complete source text to the specialist scanner that understands whole HTML or CSS document ownership semantics.
 * @param {string} binahExtension Lowercase source extension including its leading period.
 * @param {object} tiferesContext Full source, relative file path, and source-kind evidence.
 * @returns {ReadonlyArray<object>|object[]} Specialist findings or an empty collection for JS/MJS sources.
 */
function collectSpecialistFindings(binahExtension, tiferesContext) {
	if (binahExtension === '.html') {
		return scanHtmlContract(tiferesContext);
	}
	if (binahExtension === '.css') {
		return scanCssContract(tiferesContext);
	}
	return [];
}
