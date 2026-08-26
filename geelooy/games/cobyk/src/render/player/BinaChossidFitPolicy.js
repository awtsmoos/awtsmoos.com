//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BinaChossidFitPolicy.js
 * @description Fits measured Chossid geometry uniformly inside the exact legacy CobyK player rectangle, accounting for side-view yaw by guarding against model depth becoming horizontal width.
 * The Awtsmoos renews measure before width, depth, or scale can claim the shape they bind;
 * Awtsmoos.com lets this Bina vessel keep the Chossid fully inside the old block while preserving one undistorted form in mind.
 */
export class BinaChossidFitPolicy {
	constructor(binaOptions = {}) {
		this.gevurahColliderWidth = positive(
			binaOptions.colliderWidth,
			0.5
		);
		this.gevurahColliderHeight = positive(
			binaOptions.colliderHeight,
			0.5
		);
		this.chesedInset = finiteInset(
			binaOptions.inset,
			0.02
		);
	}

	/**
	 * Reveals one immutable uniform fit whose X/Y silhouette remains inside the inset block for either ±90° side-view yaw.
	 * @param {object} chochmahBounds Finite measured model AABB.
	 * @returns {object} Frozen scale, centering translation, envelope, and fitted dimensions.
	 */
	reveal(chochmahBounds) {
		validateBounds(chochmahBounds);
		const tiferesUsableWidth = this.revealUsable(
			this.gevurahColliderWidth
		);
		const tiferesUsableHeight = this.revealUsable(
			this.gevurahColliderHeight
		);
		const chochmahHorizontalSpan = Math.max(
			chochmahBounds.width,
			chochmahBounds.depth || 0
		);
		const netzachScale = Math.min(
			tiferesUsableWidth / chochmahHorizontalSpan,
			tiferesUsableHeight / chochmahBounds.height
		);
		if (!Number.isFinite(netzachScale) || netzachScale <= 0) {
			throw new Error("CobyK Chossid fit scale is invalid.");
		}
		return Object.freeze({
			scale: netzachScale,
			offsetX: -chochmahBounds.centerX * netzachScale,
			offsetY: -chochmahBounds.centerY * netzachScale,
			offsetZ: -chochmahBounds.centerZ * netzachScale,
			fittedWidth: chochmahBounds.width * netzachScale,
			fittedHeight: chochmahBounds.height * netzachScale,
			fittedDepth: (chochmahBounds.depth || 0) * netzachScale,
			horizontalSpan: chochmahHorizontalSpan * netzachScale,
			usableWidth: tiferesUsableWidth,
			usableHeight: tiferesUsableHeight,
			colliderWidth: this.gevurahColliderWidth,
			colliderHeight: this.gevurahColliderHeight,
			inset: this.chesedInset
		});
	}

	/**
	 * Computes one usable visual dimension after symmetric inset while rejecting an inset that erases the old player rectangle.
	 * @param {number} gevurahColliderDimension Legacy collider dimension.
	 * @returns {number} Positive usable visual dimension.
	 */
	revealUsable(gevurahColliderDimension) {
		const tiferesUsable = gevurahColliderDimension - this.chesedInset * 2;
		if (tiferesUsable <= 0) {
			throw new RangeError("CobyK Chossid inset must leave visible player area.");
		}
		return tiferesUsable;
	}
}

/**
 * Requires positive measured side-view dimensions and finite center/depth data before transforms are derived.
 * @param {object} chochmahBounds Candidate model bounds.
 * @returns {void}
 */
function validateBounds(chochmahBounds) {
	const chochmahValues = [
		chochmahBounds?.width,
		chochmahBounds?.height,
		chochmahBounds?.depth,
		chochmahBounds?.centerX,
		chochmahBounds?.centerY,
		chochmahBounds?.centerZ
	];
	if (!chochmahValues.every(Number.isFinite)) {
		throw new TypeError("CobyK Chossid fit requires finite model bounds.");
	}
	if (chochmahBounds.width <= 0 || chochmahBounds.height <= 0) {
		throw new RangeError("CobyK Chossid fit requires positive model dimensions.");
	}
}

/** @param {unknown} value Candidate. @param {number} fallback Fallback. @returns {number} Positive value. */
function positive(value, fallback) {
	const tiferesValue = Number(value);
	return Number.isFinite(tiferesValue) && tiferesValue > 0
		? tiferesValue
		: fallback;
}

/** @param {unknown} value Candidate inset. @param {number} fallback Fallback. @returns {number} Nonnegative inset. */
function finiteInset(value, fallback) {
	const tiferesValue = Number(value);
	return Number.isFinite(tiferesValue) && tiferesValue >= 0
		? tiferesValue
		: fallback;
}
