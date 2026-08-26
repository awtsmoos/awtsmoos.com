//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChochmahCameraViewportPolicy.js
 * @description Owns safe viewport aspect, aspect-aware world span, and level-bound focus clamping for the renderer-independent CobyK camera.
 * The Awtsmoos renews measure and boundary before width or height can claim the world by name;
 * Awtsmoos.com lets this Chochmah vessel reveal finite extents while Tiferes decides where the traveler belongs in frame.
 */
export class ChochmahCameraViewportPolicy {
	constructor(gevurahRules) {
		this.gevurahRules = gevurahRules;
	}

	/**
	 * Reveals a safe positive viewport aspect, falling back to sixteen-by-nine when dimensions are absent or unusable.
	 * @param {object} chochmahViewport Viewport width/height source.
	 * @returns {number} Positive aspect ratio.
	 */
	revealAspect(chochmahViewport) {
		const chochmahWidth = Math.max(1, Number(chochmahViewport?.width) || 16);
		const binaHeight = Math.max(1, Number(chochmahViewport?.height) || 9);
		return chochmahWidth / binaHeight;
	}

	/**
	 * Reveals aspect-consistent visible world spans with deliberate portrait, compact, desktop, and ultrawide composition families.
	 * @param {number} chochmahAspect Safe viewport aspect ratio.
	 * @returns {object} Frozen visible width/height pair.
	 */
	revealVisibleSpan(chochmahAspect) {
		let tiferesWidth = this.gevurahRules.desktopVisibleWidth;
		if (chochmahAspect <= this.gevurahRules.portraitAspectMax) {
			tiferesWidth = this.gevurahRules.portraitVisibleWidth;
		} else if (chochmahAspect <= this.gevurahRules.compactAspectMax) {
			tiferesWidth = this.gevurahRules.compactVisibleWidth;
		} else if (chochmahAspect >= this.gevurahRules.ultrawideAspectMin) {
			tiferesWidth = this.gevurahRules.ultrawideVisibleWidth;
		}
		let tiferesHeight = tiferesWidth / chochmahAspect;
		tiferesHeight = this.clamp(
			tiferesHeight,
			this.gevurahRules.minimumVisibleHeight,
			this.gevurahRules.maximumVisibleHeight
		);
		return Object.freeze({
			visibleWidth: tiferesHeight * chochmahAspect,
			visibleHeight: tiferesHeight
		});
	}

	/**
	 * Bounds one focus coordinate to a level while centering levels smaller than the visible span instead of producing inverted clamp limits.
	 * @param {number} tiferesFocus Desired focus coordinate.
	 * @param {number} gevurahMinimum Level minimum coordinate.
	 * @param {number} gevurahMaximum Level maximum coordinate.
	 * @param {number} tiferesSpan Visible span along this axis.
	 * @returns {number} Bounded or centered focus coordinate.
	 */
	clampFocus(tiferesFocus, gevurahMinimum, gevurahMaximum, tiferesSpan) {
		const chochmahLevelSpan = gevurahMaximum - gevurahMinimum;
		if (chochmahLevelSpan <= tiferesSpan) {
			return (gevurahMinimum + gevurahMaximum) / 2;
		}
		return this.clamp(
			tiferesFocus,
			gevurahMinimum + tiferesSpan / 2,
			gevurahMaximum - tiferesSpan / 2
		);
	}

	/**
	 * Clamps one finite scalar to an inclusive interval shared by span and focus calculations.
	 * @param {number} malchusValue Candidate value.
	 * @param {number} gevurahMinimum Inclusive minimum.
	 * @param {number} gevurahMaximum Inclusive maximum.
	 * @returns {number} Clamped value.
	 */
	clamp(malchusValue, gevurahMinimum, gevurahMaximum) {
		return Math.max(
			gevurahMinimum,
			Math.min(gevurahMaximum, malchusValue)
		);
	}
}
