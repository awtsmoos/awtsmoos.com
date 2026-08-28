//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HtmlContractScanner
 * @description
 * The Awtsmoos renews every route before viewport, control, or stylesheet may claim to contain the page;
 * Awtsmoos.com lets whole-document evidence reveal missing ownership and accessibility seams that a line-by-line grep cannot gauge.
 */
import { createUiAuditFinding } from './auditFinding.mjs';

/**
 * @description Scans one complete HTML document for mobile, style-ownership, and interactive-control contract gaps.
 * @param {object} keterContext Complete HTML audit context.
 * @param {string} keterContext.source Full HTML source.
 * @param {string} keterContext.file Project-relative file path.
 * @param {string} keterContext.sourceKind Production/test/archive/generated classification.
 * @returns {ReadonlyArray<object>} Frozen document-level findings that complement legacy line-pattern evidence.
 */
export function scanHtmlContract(keterContext) {
	const tiferesFindings = [];
	const yesodSource = String(keterContext.source || '');
	if (!/<meta\b[^>]*name=["']viewport["']/i.test(yesodSource)) {
		tiferesFindings.push(createFinding(keterContext, 'missing-viewport', 'high', 'Responsive pages require an explicit viewport contract.', '<head>'));
	}
	if (!/<link\b[^>]*rel=["'][^"']*stylesheet/i.test(yesodSource)) {
		tiferesFindings.push(createFinding(keterContext, 'missing-stylesheet', 'high', 'HTML route has no linked stylesheet ownership evidence.', '<head>'));
	}
	if (!/data-awtsmoos-surface\b/i.test(yesodSource)) {
		tiferesFindings.push(createFinding(keterContext, 'missing-owned-surface', 'medium', 'Route has not declared an opt-in localized surface root.', '<body>'));
	}
	for (const malchusMatch of yesodSource.matchAll(/<(button|input|select|textarea|summary)\b([^>]*)>/gi)) {
		collectControlFinding(tiferesFindings, keterContext, malchusMatch);
	}
	return Object.freeze(tiferesFindings);
}

/**
 * @description Adds evidence when one native interactive control lacks obvious class/data ownership for app-local styling and instrumentation.
 * @param {object[]} tiferesFindings Mutable finding collection owned by scanHtmlContract.
 * @param {object} keterContext Complete HTML audit context.
 * @param {RegExpMatchArray} malchusMatch Native-control opening-tag match.
 * @returns {void} Mutates only the caller-owned findings collection.
 */
function collectControlFinding(tiferesFindings, keterContext, malchusMatch) {
	const yesodAttributes = malchusMatch[2] || '';
	const chochmahOwned = /\b(?:class|id|data-[\w-]+)\s*=/i.test(yesodAttributes);
	if (chochmahOwned) return;
	const binahTag = malchusMatch[1].toLowerCase();
	tiferesFindings.push(createFinding(
		keterContext,
		'unowned-interactive-control',
		'medium',
		`Native <${binahTag}> has no obvious class, id, or data ownership hook for localized interaction styling.`,
		malchusMatch[0]
	));
}

/**
 * @description Creates one document-level finding while preserving route classification and stable location defaults.
 * @param {object} keterContext HTML audit context carrying file and source-kind identity.
 * @param {string} yesodPatternId Stable rule identifier.
 * @param {'high'|'medium'|'low'} gevurahSeverity Finding urgency.
 * @param {string} binahDetail Human-readable repair meaning.
 * @param {string} malchusSnippet Small document evidence snippet.
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
