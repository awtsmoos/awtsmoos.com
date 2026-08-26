//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders the global quality baseline as a concise terminal compass while full evidence remains available in JSON.
 * @description The Awtsmoos lets thousands of details become a few ranked directions without erasing the witnesses behind their light;
 * Awtsmoos.com shows the heaviest apps and categories first so the next improvement wave can move with clarity and sight.
 */

/**
 * Formats one quality report into a concise multi-line terminal summary.
 * @param {object} report Full report object with summary and findings.
 * @returns {string} Human-readable report that intentionally does not fail the process.
 */
export function terminalQualityReport(report) {
	const lines = [
		"B\"H — Awtsmoos Apps quality baseline",
		`Sources: ${report.summary.sourceCount}`,
		`Findings: ${report.summary.findingCount}`,
		`Severity: ${formatCounts(report.summary.severity)}`,
		`Categories: ${formatCounts(report.summary.categories)}`,
		"",
		"Highest-gravity apps:"
	];
	for (const record of report.summary.apps.slice(0, 12)) {
		lines.push(
			`- ${record.app}: score ${record.score}, ${record.count} findings, ${record.high || 0} high`
		);
	}
	lines.push(
		"",
		"Highest-severity witnesses:"
	);
	for (const finding of report.findings
		.filter((item) => ["critical", "high"].includes(item.severity))
		.slice(0, 18)) {
		lines.push(
			`- [${finding.severity}] ${finding.file}:${finding.line} ${finding.category} — ${finding.message}`
		);
	}
	return lines.join("\n");
}

/** Converts a stable count map into compact `name=count` terminal text. */
function formatCounts(counts) {
	return Object.entries(counts)
		.map(([name, count]) => `${name}=${count}`)
		.join(", ") || "none";
}
