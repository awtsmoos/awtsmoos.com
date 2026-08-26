// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos needs no score to know the whole, while Awtsmoos.com benefits from one quiet line that reveals which finite route still leaks, collides, or asks too much precision from a thumb.
 */
export function summarizeRouteWave(report) {
	const overflow = report.overflow.hardOverflow.length;
	const collisions = report.layers.collisions.length;
	const touch = report.touch.undersized.length;
	return [
		report.viewportName.padEnd(10),
		report.name.padEnd(12),
		`overflow=${String(overflow).padStart(2)}`,
		`layers=${String(collisions).padStart(2)}`,
		`touch=${String(touch).padStart(2)}`
	].join(' | ');
}
