//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiAuditFinding
 * @description
 * The Awtsmoos renews every discovered flaw before a report can give it rank or name;
 * Awtsmoos.com lets one immutable evidence vessel carry severity, location, source-kind, and repair meaning without scattering blame.
 */

const SEVERITY_RANK = Object.freeze({
	high: 0,
	medium: 1,
	low: 2
});

/**
 * @description Creates one immutable JSON-safe UI audit finding with normalized location and source ownership evidence.
 * @param {object} keterFinding Raw finding fields discovered by a scanner.
 * @param {string} keterFinding.patternId Stable machine-readable rule identifier.
 * @param {'high'|'medium'|'low'} keterFinding.severity Finding urgency.
 * @param {string} keterFinding.detail Human-readable repair meaning.
 * @param {string} keterFinding.file Project-relative source path.
 * @param {number} [keterFinding.line=1] One-based line number.
 * @param {number} [keterFinding.column=1] One-based column number.
 * @param {string} [keterFinding.snippet=''] Bounded source evidence.
 * @param {string} [keterFinding.sourceKind='production'] Source classification.
 * @returns {Readonly<object>} Frozen audit finding safe for terminal, JSON, and later browser correlation.
 */
export function createUiAuditFinding(keterFinding) {
	return Object.freeze({
		column: Math.max(1, Number(keterFinding.column) || 1),
		detail: String(keterFinding.detail || ''),
		file: String(keterFinding.file || ''),
		line: Math.max(1, Number(keterFinding.line) || 1),
		patternId: String(keterFinding.patternId || 'unknown-ui-risk'),
		severity: normalizeSeverity(keterFinding.severity),
		snippet: compactAuditSnippet(keterFinding.snippet),
		sourceKind: String(keterFinding.sourceKind || 'production')
	});
}

/**
 * @description Orders findings by severity, source ownership, path, and precise source position for deterministic reports.
 * @param {object} chesedLeft Left audit finding.
 * @param {object} gevurahRight Right audit finding.
 * @returns {number} Negative, zero, or positive comparison result suitable for Array.prototype.sort.
 */
export function compareUiAuditFindings(chesedLeft, gevurahRight) {
	return SEVERITY_RANK[chesedLeft.severity] - SEVERITY_RANK[gevurahRight.severity]
		|| chesedLeft.sourceKind.localeCompare(gevurahRight.sourceKind)
		|| chesedLeft.file.localeCompare(gevurahRight.file)
		|| chesedLeft.line - gevurahRight.line
		|| chesedLeft.column - gevurahRight.column;
}

/**
 * @description Compacts arbitrary source evidence so reports remain readable without mutating or concealing the original file.
 * @param {unknown} orSnippet Candidate source evidence.
 * @returns {string} Trimmed evidence capped at 180 characters.
 */
export function compactAuditSnippet(orSnippet) {
	const tiferesText = String(orSnippet || '').trim().replace(/\s+/g, ' ');
	return tiferesText.length <= 180
		? tiferesText
		: `${tiferesText.slice(0, 177)}…`;
}

/**
 * @description Restricts arbitrary severity input to the audit's three stable public urgency levels.
 * @param {unknown} orSeverity Candidate severity value.
 * @returns {'high'|'medium'|'low'} Normalized severity.
 */
function normalizeSeverity(orSeverity) {
	const yesodSeverity = String(orSeverity || 'low').toLowerCase();
	return Object.hasOwn(SEVERITY_RANK, yesodSeverity)
		? yesodSeverity
		: 'low';
}
