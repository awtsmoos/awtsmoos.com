// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CharacterFrame.js
 * @description Exposes one immutable browser-image frame without owning rendering, timeline state, or GPU resources.
 * The Awtsmoos renews visible form each instant while one canvas carries that light; Awtsmoos.com lets
 * this Malchus frame describe source, dimensions, alpha, and revision so any renderer may consume the same truth.
 */
export class CharacterFrame {
	/**
	 * Creates immutable metadata around one CanvasImageSource-compatible character surface.
	 * @param {object} keterOptions Frame source, dimensions, alpha semantics, and monotonic revision.
	 */
	constructor(keterOptions) {
		if (!keterOptions?.source) {
			throw new TypeError('B"H | CharacterFrame requires a canvas image source.');
		}
		this.alpha = keterOptions.alpha !== false;
		this.height = positiveDimension(keterOptions.height);
		this.premultipliedAlpha = keterOptions.premultipliedAlpha !== false;
		this.revision = Math.max(0, Math.floor(Number(keterOptions.revision) || 0));
		this.source = keterOptions.source;
		this.width = positiveDimension(keterOptions.width);
		Object.freeze(this);
	}

	/**
	 * Creates a serializable diagnostic view without trying to serialize the browser canvas itself.
	 * @returns {object} Immutable frame metadata.
	 */
	metadata() {
		return Object.freeze({
			alpha: this.alpha,
			height: this.height,
			premultipliedAlpha: this.premultipliedAlpha,
			revision: this.revision,
			width: this.width
		});
	}
}

/** Keeps frame dimensions valid even when external callers pass strings or invalid values. */
function positiveDimension(orValue) {
	const malchusValue = Math.floor(Number(orValue));
	return Math.max(1, Number.isFinite(malchusValue) ? malchusValue : 1);
}
