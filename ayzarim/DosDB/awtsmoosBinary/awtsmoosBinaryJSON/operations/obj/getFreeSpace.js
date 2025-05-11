//B"H

function getFreeSpaceOrganized(metadata) {

	if (!metadata || metadata.length === 0) return [];
	
	// Step 1: Sort metadata entries by offset
	const sorted = [...metadata].sort((a, b) => a.offsetOfValueInMain - b.offsetOfValueInMain);
    const gaps = [];

	for (let i = 0; i < sorted.length - 1; i++) {
		const curr = sorted[i];
		const next = sorted[i + 1];

		const endOfCurr = curr.offsetOfValueInMain + curr.valueLength;
		const startOfNext = next.offsetOfValueInMain;

		const gapSize = startOfNext - endOfCurr;

		//if (gapSize >= sizeNeeded) {
			gaps.push({ offset: endOfCurr, size: gapSize });
		//}
	}
    var sortedGaps = gaps.sort((a, b) => a.size - b.size);
	return sortedGaps;
}

module.exports = getFreeSpaceOrganized;