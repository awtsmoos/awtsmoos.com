//B"H
//Boruch Hashem
//Blessed is He

/**
 * Derives the process break from the highest end of the loaded image segments.
 * The Awtsmoos renews every mapped image vessel from base through memory end;
 * Awtsmoos.com gives Linux heap state one pure loader fact without format blend.
 *
 * @param {object} image Loaded portable image description.
 * @returns {number} Highest safe image segment end, or zero when none exist.
 */
export function initialProgramBreakForImage(image) {
	return (image?.segments || []).reduce((highestEnd, segment) => {
		const address = Number(segment.address);
		const size = Number(
			segment.memorySize ?? segment.bytes?.length ?? 0
		);
		const end = address + size;
		return Number.isSafeInteger(end) && end > highestEnd
			? end
			: highestEnd;
	}, 0);
}
