// B"H
// Boruch Hashem
// Blessed is He

import { SEVERITY_WEIGHT, isSeverity } from './UiHygieneFinding.mjs';

/**
 * @module UiHygieneReporter
 * @description
 * The Awtsmoos is beyond count and category, while Awtsmoos.com needs findings to
 * become intelligible migration evidence. This Malchus-like reporter derives machine
 * JSON, human text, and strict-gate truth from one normalized record family, rejecting
 * unknown thresholds rather than allowing a typo to extinguish enforcement in light.
 */

/** Builds a deterministic aggregate summary from normalized findings. */
export function summarizeFindings(findings = []) {
	const bySeverity = Object.fromEntries(Object.keys(SEVERITY_WEIGHT).map(key => [key, 0]));
	const byCode = {};
	const files = new Set();
	for (const finding of findings) {
		bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
		byCode[finding.code] = (byCode[finding.code] || 0) + 1;
		files.add(finding.file);
	}
	return {
		total: findings.length,
		files: files.size,
		bySeverity,
		byCode: Object.fromEntries(Object.entries(byCode).sort())
	};
}

/** Produces JSON-safe report data without leaking class instances or Sets. */
export function jsonReport(findings = []) {
	return {
		summary: summarizeFindings(findings),
		findings: findings.map(finding => finding.toJSON?.() || { ...finding })
	};
}

/** Produces concise deterministic text from already sorted findings. */
export function textReport(findings = []) {
	const summary = summarizeFindings(findings);
	const heading = [
		'B"H UI Hygiene Report',
		`Findings: ${summary.total} across ${summary.files} files`,
		`Critical ${summary.bySeverity.critical} · Error ${summary.bySeverity.error} · ` +
			`Warning ${summary.bySeverity.warning} · Advisory ${summary.bySeverity.advisory}`
	];
	if (!findings.length) return `${heading.join('\n')}\nNo findings.`;
	const lines = findings.map(finding => {
		const selector = finding.selector ? ` [${finding.selector}]` : '';
		return `${finding.severity.toUpperCase()} ${finding.code} ` +
			`${finding.file}:${finding.line}${selector} — ${finding.message}`;
	});
	return [...heading, '', ...lines].join('\n');
}

/** Reports whether findings meet or exceed one validated strict severity threshold. */
export function exceedsThreshold(findings = [], threshold = 'critical') {
	const candidate = String(threshold || '').toLowerCase();
	if (!isSeverity(candidate)) {
		throw new RangeError(`ui_hygiene_invalid_severity:${threshold}`);
	}
	const floor = SEVERITY_WEIGHT[candidate];
	return findings.some(finding => SEVERITY_WEIGHT[finding.severity] >= floor);
}
