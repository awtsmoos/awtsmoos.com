//B"H

function getFreeSpaceOrganized(metadata) {

	if (!metadata || metadata.length === 0) return [];
	
	// Step 1: Sort metadata entries by offset
	const sorted = [...metadata].sort((a, b) => a.offsetOfValueInMain - b.offsetOfValueInMain);
	var f = sorted[0];
	
	const gaps = [];

	for (let i = 0; i < sorted.length - 1; i++) {
		const curr = sorted[i];
		const next = sorted[i + 1];

		const endOfCurr = curr.offsetOfValueInMain + curr.valueLength;
		const startOfNext = next.offsetOfValueInMain;

		const gapSize = startOfNext - endOfCurr;

		if (gapSize > 0) {
			gaps.push({ offset: endOfCurr, size: gapSize });
		}
	}
    var sortedGaps = gaps.sort((a, b) => a.size - b.size);
	var of = f.offsetOfValueInMain
	if(of > 3) {
		var firstGap = {
			offset: 3,
			size: of - 3
		}
		sortedGaps.unshift(firstGap);
	}

	return sortedGaps;
}

module.exports = getFreeSpaceOrganized;