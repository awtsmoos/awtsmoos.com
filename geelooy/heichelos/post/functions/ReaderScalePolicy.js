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
		// B"H — Yaakov 2026-10-15: larger default (was 42); NO maximum —
		// users can increase indefinitely.
		this.defaultSize = 48;
		this.minimumSize = 18;
		this.maximumSize = Infinity;
		this.stepSize = 4;
	}

	/**
	 * Normalizes an unknown size into the reader's supported interval.
	 * B"H — Yaakov 2026-10-15: no upper bound; users can increase indefinitely.
	 * @param {unknown} ohrValue Candidate scale value.
	 * @param {number} fallback Safe fallback size.
	 * @returns {number} Finite bounded size.
	 */
	normalize(ohrValue, fallback = this.defaultSize) {
		const gevurahSize = Number.parseFloat(ohrValue);

		if (!Number.isFinite(gevurahSize)) {
			return fallback;
		}

		const bounded = Math.max(this.minimumSize, gevurahSize);
		// Only apply maximum when it's finite (Infinity = no limit).
		return Number.isFinite(this.maximumSize)
			? Math.min(this.maximumSize, bounded)
			: bounded;
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
	 * Derives one secondary scale from the main reading size.
	 * B"H — Yaakov 2026-10-15: maximum may be Infinity (no cap).
	 * @param {number} mainSize Main text size.
	 * @param {number} ratio Relative scale ratio.
	 * @param {number} minimum Minimum derived size.
	 * @param {number} maximum Maximum derived size (Infinity = no cap).
	 * @returns {string} Bounded CSS pixel value.
	 */
	derive(mainSize, ratio, minimum, maximum) {
		const scaled = Math.max(minimum, mainSize * ratio);
		const gevurahDerived = Number.isFinite(maximum)
			? Math.min(maximum, scaled)
			: scaled;
		return this.toPixels(gevurahDerived);
	}

	/**
	 * Builds every reader-local typography custom property from one main size.
	 * B"H — Yaakov 2026-10-15: derived sizes have no upper cap.
	 * @param {unknown} ohrSize Candidate main size.
	 * @returns {Record<string, string>} Localized CSS variable map.
	 */
	buildScale(ohrSize) {
		const mainSize = this.normalize(ohrSize);
		const NO_CAP = Infinity;

		return {
			'--post-text-size': this.toPixels(mainSize),
			'--post-scale-ratio': String(Math.round((mainSize / this.defaultSize) * 10000) / 10000),
			'--post-inline-body-size': this.derive(mainSize, 0.86, 30, NO_CAP),
			'--post-sidebar-comment-size': this.derive(mainSize, 0.62, 22, NO_CAP),
			'--post-inline-summary-size': this.derive(mainSize, 0.18, 13, NO_CAP),
			'--post-inline-label-size': this.derive(mainSize, 0.16, 13, NO_CAP),
			'--post-inline-meta-size': this.derive(mainSize, 0.145, 12, NO_CAP),
			'--post-ui-chip-size': this.derive(mainSize, 0.17, 14, NO_CAP)
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
