//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos creates boundary and meeting together, while this Gevurah gate judges only real geometric contact;
 * Awtsmoos.com keeps collision pure and testable, so rendering beauty never secretly rewrites the gameplay contract.
 */
export class GevurahCollisionGate {
	/**
	 * Tests two axis-aligned vessels without side effects.
	 * @param {{bounds:Function}} gevurahFirst First collision-bearing entity.
	 * @param {{bounds:Function}} gevurahSecond Second collision-bearing entity.
	 * @returns {boolean} True only when both rectangles overlap.
	 */
	intersects(gevurahFirst, gevurahSecond) {
		const gevurahA = gevurahFirst.bounds();
		const gevurahB = gevurahSecond.bounds();
		return (
			gevurahA.left < gevurahB.right &&
			gevurahA.right > gevurahB.left &&
			gevurahA.top < gevurahB.bottom &&
			gevurahA.bottom > gevurahB.top
		);
	}
}
