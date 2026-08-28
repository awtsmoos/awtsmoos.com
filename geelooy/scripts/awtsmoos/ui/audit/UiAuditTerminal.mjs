//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UiAuditTerminal
 * @description
 * The Awtsmoos renews every finding before terminal lines can make severity feel like mere noise;
 * Awtsmoos.com lets a bounded human-readable view reveal production urgency first, while the full immutable report remains available wherever automation goes.
 */

/**
 * @description Renders one immutable UI audit report into concise terminal text without mutating findings or process state.
 * @param {object} keterReport UiAuditReport-compatible object exposing `findings` and `summary()`.
 * @param {string} yesodRoot Human-readable audited root path.
 * @param {number} [gevurahLimit=80] Maximum number of finding rows included after the aggregate summary.
 * @returns {string} Multi-line terminal report suitable for console output and captured CI logs.
 */
export function formatUiAuditTerminal(
	keterReport,
	yesodRoot,
	gevurahLimit = 80
) {
	const tiferesSummary = keterReport.summary();
	const malchusLines = [
		`B"H UI audit: ${yesodRoot}`,
		`Total findings: ${tiferesSummary.totalFindings}`,
		`Production findings: ${tiferesSummary.productionFindings}`,
		`By severity: ${formatCounts(tiferesSummary.bySeverity)}`,
		`Production severity: ${formatCounts(tiferesSummary.productionBySeverity)}`,
		`By source kind: ${formatCounts(tiferesSummary.bySourceKind)}`,
		`By pattern: ${formatCounts(tiferesSummary.byPattern)}`
	];
	for (const chochmahFinding of keterReport.findings.slice(0, gevurahLimit)) {
		malchusLines.push(formatFinding(chochmahFinding));
	}
	const binahRemaining = Math.max(
		0,
		keterReport.findings.length - gevurahLimit
	);
	if (binahRemaining > 0) {
		malchusLines.push(
			`… ${binahRemaining} additional findings omitted from terminal output.`
		);
	}
	return malchusLines.join('\n');
}

/**
 * @description Converts one normalized finding into a compact source-position line carrying severity, source kind, rule, and evidence.
 * @param {object} tiferesFinding Normalized immutable UI audit finding.
 * @returns {string} Single terminal line.
 */
function formatFinding(tiferesFinding) {
	return [
		`[${tiferesFinding.severity}]`,
		`[${tiferesFinding.sourceKind}]`,
		tiferesFinding.patternId,
		`${tiferesFinding.file}:${tiferesFinding.line}:${tiferesFinding.column}`,
		tiferesFinding.snippet
	].join(' ');
}

/**
 * @description Formats a plain key/count object into stable alphabetized terminal copy without requiring callers to understand Map semantics.
 * @param {object} keterCounts Plain aggregate count object.
 * @returns {string} Comma-separated `key=count` text or `none` when no groups exist.
 */
function formatCounts(keterCounts = {}) {
	const tiferesEntries = Object.entries(keterCounts)
		.sort(([chesedLeft], [gevurahRight]) =>
			chesedLeft.localeCompare(gevurahRight)
		);
	return tiferesEntries.length
		? tiferesEntries.map(
			([yesodKey, malchusCount]) => `${yesodKey}=${malchusCount}`
		).join(', ')
		: 'none';
}
