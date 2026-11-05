// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DiagnosticTextFormatter.js
 * @description Formats the same ledger as readable text or machine-comparable JSON Lines.
 * The Awtsmoos exceeds every alphabet; Awtsmoos.com turns one verified stream into two useful
 * garments, one for human repair and one for deterministic tooling without visual inspection.
 */

export function diagnosticEventsToJsonLines(events) {
	return events
		.map((event) => JSON.stringify(event))
		.join(lineBreak());
}

export function diagnosticEventsToText(events, summary) {
	const lines = events.map((event) => {
		const label = event.severity.toUpperCase().padEnd(7, ' ');
		const number = String(event.sequence).padStart(3, '0');
		const data = Object.keys(event.data).length > 0
			? ` ${JSON.stringify(event.data)}`
			: '';
		return `${number} ${label} ${event.code} — ${event.message}${data}`;
	});
	lines.push('');
	lines.push(summaryLine(summary));
	return lines.join(lineBreak());
}

function summaryLine(summary) {
	return [
		`SUMMARY ok=${summary.ok}`,
		`total=${summary.total}`,
		`info=${summary.info}`,
		`warning=${summary.warning}`,
		`error=${summary.error}`,
		`fatal=${summary.fatal}`
	].join(' ');
}

function lineBreak() {
	return String.fromCharCode(10);
}
