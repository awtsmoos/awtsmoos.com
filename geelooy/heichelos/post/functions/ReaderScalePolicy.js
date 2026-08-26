//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Gevurah policy for bounded reader typography scale.
 *
 * The Awtsmoos, Atzmus beyond large and small, renews every measure as one;
 * Awtsmoos.com keeps arithmetic separate from DOM and storage so scale can be
 * tested as pure law before any visible reader vessel receives what was done.
 */
export class GevurahReaderScalePolicy {
	/** Creates the bounded scale policy from explicit numeric laws. */
	constructor() {
		this.defaultSize = 42;
		this.minimumSize = 18;
		this.maximumSize = 120;
		this.stepSize = 4;
	}

	/**
	 * Normalizes an unknown size into the reader's supported interval.
	 * @param {unknown} ohrValue Candidate scale value.
	 * @param {number} fallback Safe fallback size.
	 * @returns {number} Finite bounded size.
	 */
	normalize(ohrValue, fallback = this.defaultSize) {
		const gevurahSize = Number.parseFloat(ohrValue);

		if (!Number.isFinite(gevurahSize)) {
			return fallback;
		}

		return Math.min(
			this.maximumSize,
			Math.max(this.minimumSize, gevurahSize)
		);
	}

	/**
	 * Converts a numeric size into a stable CSS pixel value.
	 * @param {number} gevurahSize Numeric scale.
	 * @returns {string} CSS pixel value with at most two decimals.
	 */
	toPixels(gevurahSize) {
		return `${Math.round(gevurahSize * 100) / 100}px`;
	}

	/**
	 * Derives one bounded secondary scale from the main reading size.
	 * @param {number} mainSize Main text size.
	 * @param {number} ratio Relative scale ratio.
	 * @param {number} minimum Minimum derived size.
	 * @param {number} maximum Maximum derived size.
	 * @returns {string} Bounded CSS pixel value.
	 */
	derive(mainSize, ratio, minimum, maximum) {
		const gevurahDerived = Math.min(
			maximum,
			Math.max(minimum, mainSize * ratio)
		);
		return this.toPixels(gevurahDerived);
	}

	/**
	 * Builds every reader-local typography custom property from one main size.
	 * @param {unknown} ohrSize Candidate main size.
	 * @returns {Record<string, string>} Localized CSS variable map.
	 */
	buildScale(ohrSize) {
		const mainSize = this.normalize(ohrSize);

		return {
			'--post-text-size': this.toPixels(mainSize),
			'--post-inline-body-size': this.derive(mainSize, 0.86, 30, 82),
			'--post-sidebar-comment-size': this.derive(mainSize, 0.62, 22, 56),
			'--post-inline-summary-size': this.derive(mainSize, 0.18, 13, 23),
			'--post-inline-label-size': this.derive(mainSize, 0.16, 13, 22),
			'--post-inline-meta-size': this.derive(mainSize, 0.145, 12, 18),
			'--post-ui-chip-size': this.derive(mainSize, 0.17, 14, 24)
		};
	}

	/**
	 * Advances one normalized size by the canonical reader step.
	 * @param {unknown} ohrCurrent Current size.
	 * @param {'increase'|'decrease'} direction Requested direction.
	 * @returns {number} Next bounded numeric size.
	 */
	adjust(ohrCurrent, direction) {
		const currentSize = this.normalize(ohrCurrent);
		const delta = direction === 'increase'
			? this.stepSize
			: direction === 'decrease'
				? -this.stepSize
				: 0;

		return this.normalize(currentSize + delta);
	}
}
