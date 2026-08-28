//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssContractScanner
 * @description
 * The Awtsmoos renews every selector before a cascade can cross a boundary it was never meant to know;
 * Awtsmoos.com measures only true ownership leakage, rigid widths, and literal layer debt without condemning scoped app roots.
 */
import { createUiAuditFinding } from './auditFinding.mjs';
import { isUnownedGlobalSelector } from './cssOwnershipPolicy.mjs';

const HARD_WIDTH = /\b(?:width|min-width)\s*:\s*(\d{3,})px\s*;/gi;
const Z_INDEX = /\bz-index\s*:\s*(-?\d+)\s*;/gi;

/**
 * Scans one complete stylesheet for ownership, mobile width, and semantic-layer risks.
 * @param {{source:string,file:string,sourceKind:string}} keterContext CSS audit context.
 * @returns {ReadonlyArray<object>} Frozen normalized findings.
 */
export function scanCssContract(keterContext) {
	const tiferesFindings = [];
	const yesodSource = removeCssComments(keterContext.source);
	collectSelectorFindings(tiferesFindings, keterContext, yesodSource);
	collectDeclarationFindings(tiferesFindings, keterContext, yesodSource);
	return Object.freeze(tiferesFindings);
}

/** @param {object[]} findings Mutable local findings. @param {object} context CSS context. @param {string} source Comment-free CSS. */
function collectSelectorFindings(findings, context, source) {
	for (const match of source.matchAll(/([^{}]+)\{/g)) {
		const prelude = String(match[1] || '').trim();
		if (!prelude || prelude.startsWith('@')) {
			continue;
		}
		for (const rawSelector of prelude.split(',')) {
			const selector = rawSelector.trim();
			if (!isUnownedGlobalSelector({ file: context.file, selector })) {
				continue;
			}
			findings.push(createFinding(
				context,
				'unscoped-global-selector',
				'high',
				'Document-global selector can leak presentation across unrelated applications.',
				selector
			));
		}
	}
}

/** @param {object[]} findings Mutable local findings. @param {object} context CSS context. @param {string} source Comment-free CSS. */
function collectDeclarationFindings(findings, context, source) {
	for (const match of source.matchAll(HARD_WIDTH)) {
		if (Number(match[1]) < 480) {
			continue;
		}
		findings.push(createFinding(
			context,
			'rigid-pixel-width',
			'medium',
			'Large fixed or minimum pixel width deserves explicit mobile overflow review.',
			match[0]
		));
	}
	for (const match of source.matchAll(Z_INDEX)) {
		if (Math.abs(Number(match[1])) < 100) {
			continue;
		}
		findings.push(createFinding(
			context,
			'extreme-z-index',
			'medium',
			'Large literal z-index bypasses an explicit component-owned elevation scale.',
			match[0]
		));
	}
}

/** @param {unknown} source Candidate stylesheet text. @returns {string} Comment-free analysis text. */
function removeCssComments(source) {
	return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/** @returns {Readonly<object>} One stable finding in the shared report contract. */
function createFinding(context, patternId, severity, detail, snippet) {
	return createUiAuditFinding({
		patternId,
		severity,
		detail,
		file: context.file,
		sourceKind: context.sourceKind,
		snippet
	});
}
