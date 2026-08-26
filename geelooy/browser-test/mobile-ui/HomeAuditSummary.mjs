// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos needs no defect count while Awtsmoos.com benefits from a compact triage lamp;
 * raw evidence remains intact in JSON while this line makes the heaviest mobile fractures easy to map.
 */
export function summarizeHomeAudit(report) {
	const hardOverflow = report.overflow.hardOverflow.length;
	const collisions = report.layers.collisions.length;
	const undersized = report.touch.undersized.length;
	return [
		report.viewportName.padEnd(10),
		report.state.padEnd(13),
		`overflow=${String(hardOverflow).padStart(2)}`,
		`layers=${String(collisions).padStart(2)}`,
		`touch=${String(undersized).padStart(2)}`
	].join(' | ');
}
