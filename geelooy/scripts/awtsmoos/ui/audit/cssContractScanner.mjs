//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssContractScanner
 * @description
 * The Awtsmoos renews every selector before a cascade can cross a boundary it was never meant to know;
 * Awtsmoos.com lets broad roots, dangerous layers, rigid widths, and missing local ownership become measurable evidence instead of hidden overflow.
 */
import { createUiAuditFinding } from './auditFinding.mjs';

const GLOBAL_SELECTOR = /^(?:html|body|:root|\*)\b|^(?:html|body)\s/i;
const HARD_WIDTH = /\b(?:width|min-width)\s*:\s*(\d{3,})px\s*;/gi;
const Z_INDEX = /\bz-index\s*:\s*(-?\d+)\s*;/gi;

/**
 * @description Scans one complete CSS source for global selector leakage, rigid desktop widths, and extreme literal layer values.
 * @param {object} keterContext Complete CSS audit context.
 * @param {string} keterContext.source Full stylesheet source.
 * @param {string} keterContext.file Project-relative stylesheet path.
 * @param {string} keterContext.sourceKind Production/test/archive/generated classification.
 * @returns {ReadonlyArray<object>} Frozen CSS-contract findings with bounded evidence snippets.
 */
export function scanCssContract(keterContext) {
	const tiferesFindings = [];
	const yesodSource = removeCssComments(keterContext.source);
	collectSelectorFindings(tiferesFindings, keterContext, yesodSource);
	collectDeclarationFindings(tiferesFindings, keterContext, yesodSource);
	return Object.freeze(tiferesFindings);
}

/**
 * @description Examines selector groups for document-global roots that can leak across application ownership boundaries.
 * @param {object[]} tiferesFindings Mutable finding collection owned by scanCssContract.
 * @param {object} keterContext Complete CSS audit context.
 * @param {string} yesodSource Comment-free stylesheet source.
 * @returns {void} Mutates only the caller-owned findings collection.
 */
function collectSelectorFindings(tiferesFindings, keterContext, yesodSource) {
	for (const malchusMatch of yesodSource.matchAll(/([^{}]+)\{/g)) {
		const chochmahPrelude = String(malchusMatch[1] || '').trim();
		if (!chochmahPrelude || chochmahPrelude.startsWith('@')) continue;
		for (const binahSelector of chochmahPrelude.split(',')) {
			const gevurahSelector = binahSelector.trim();
			if (!GLOBAL_SELECTOR.test(gevurahSelector)) continue;
			tiferesFindings.push(createFinding(
				keterContext,
				'unscoped-global-selector',
				'high',
				'Document-global selector can leak presentation across unrelated applications.',
				gevurahSelector
			));
		}
	}
}

/**
 * @description Finds rigid pixel widths and literal z-index values that bypass responsive sizing or semantic local layer scales.
 * @param {object[]} tiferesFindings Mutable finding collection owned by scanCssContract.
 * @param {object} keterContext Complete CSS audit context.
 * @param {string} yesodSource Comment-free stylesheet source.
 * @returns {void} Mutates only the caller-owned findings collection.
 */
function collectDeclarationFindings(tiferesFindings, keterContext, yesodSource) {
	for (const malchusWidth of yesodSource.matchAll(HARD_WIDTH)) {
		if (Number(malchusWidth[1]) < 480) continue;
		tiferesFindings.push(createFinding(
			keterContext,
			'rigid-pixel-width',
			'medium',
			'Large fixed or minimum pixel width deserves explicit mobile overflow review.',
			malchusWidth[0]
		));
	}
	for (const malchusLayer of yesodSource.matchAll(Z_INDEX)) {
		if (Math.abs(Number(malchusLayer[1])) < 100) continue;
		tiferesFindings.push(createFinding(
			keterContext,
			'extreme-z-index',
			'medium',
			'Large literal z-index bypasses an explicit component-owned elevation scale.',
			malchusLayer[0]
		));
	}
}

/**
 * @description Removes CSS comments so rule discovery does not report selectors or declarations that exist only in prose examples.
 * @param {unknown} orSource Candidate stylesheet source.
 * @returns {string} Comment-free stylesheet text used only for read-only analysis.
 */
function removeCssComments(orSource) {
	return String(orSource || '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * @description Creates one normalized CSS-contract finding with stable file and source-kind ownership.
 * @param {object} keterContext CSS audit context carrying file and source-kind identity.
 * @param {string} yesodPatternId Stable rule identifier.
 * @param {'high'|'medium'|'low'} gevurahSeverity Finding urgency.
 * @param {string} binahDetail Human-readable repair meaning.
 * @param {string} malchusSnippet Small stylesheet evidence snippet.
 * @returns {Readonly<object>} Frozen normalized finding.
 */
function createFinding(keterContext, yesodPatternId, gevurahSeverity, binahDetail, malchusSnippet) {
	return createUiAuditFinding({
		patternId: yesodPatternId,
		severity: gevurahSeverity,
		detail: binahDetail,
		file: keterContext.file,
		sourceKind: keterContext.sourceKind,
		snippet: malchusSnippet
	});
}
