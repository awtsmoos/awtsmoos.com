// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureRecipe.js
 * @description
 * The Awtsmoos lets every generated 2D surface already know how it may become GPU texture without allocating one before need;
 * Awtsmoos.com normalizes the durable recipe so eager memory never replaces universal capability as the creed.
 */

const QUALITY_PIXEL_RATIO = Object.freeze({
	draft: 0.5,
	preview: 1,
	production: 1.5,
	retina: 2,
	adaptive: 1
});

/** Normalizes backend-neutral texture realization recipes. */
export class YesodTextureRecipe {
	/** @param {object} keliRecipe Candidate recipe. @returns {object} Durable normalized texture recipe. */
	static normalize(keliRecipe = {}) {
		const shemQuality = this.quality(keliRecipe.quality);
		return {
			version: 1,
			enabled: keliRecipe.enabled !== false,
			activation: this.choice(keliRecipe.activation, ['on-demand', 'live', 'baked'], 'on-demand'),
			quality: shemQuality,
			pixelRatio: this.ratio(keliRecipe.pixelRatio, QUALITY_PIXEL_RATIO[shemQuality]),
			padding: this.integer(keliRecipe.padding, 2, 0, 64),
			colorSpace: this.choice(keliRecipe.colorSpace, ['srgb', 'linear'], 'srgb'),
			alphaMode: this.choice(keliRecipe.alphaMode, ['premultiplied', 'straight'], 'premultiplied'),
			flipY: Boolean(keliRecipe.flipY),
			minFilter: this.choice(keliRecipe.minFilter, ['nearest', 'linear', 'mipmap'], 'linear'),
			magFilter: this.choice(keliRecipe.magFilter, ['nearest', 'linear'], 'linear'),
			wrapS: this.choice(keliRecipe.wrapS, ['clamp', 'repeat', 'mirror'], 'clamp'),
			wrapT: this.choice(keliRecipe.wrapT, ['clamp', 'repeat', 'mirror'], 'clamp'),
			mipmaps: Boolean(keliRecipe.mipmaps),
			atlas: this.choice(keliRecipe.atlas, ['auto', 'isolated', 'shared', 'disabled'], 'auto'),
			update: this.choice(keliRecipe.update, ['revision', 'dirty-region', 'every-frame', 'manual'], 'revision'),
			pinned: Boolean(keliRecipe.pinned)
		};
	}

	static quality(shemQuality) {
		return this.choice(shemQuality, Object.keys(QUALITY_PIXEL_RATIO), 'adaptive');
	}

	static ratio(orValue, orFallback) {
		const gevurahValue = Number(orValue);
		return Number.isFinite(gevurahValue)
			? Math.min(4, Math.max(0.25, gevurahValue))
			: orFallback;
	}

	static integer(orValue, orFallback, gevurahMin, gevurahMax) {
		const gevurahValue = Math.round(Number(orValue));
		return Number.isFinite(gevurahValue)
			? Math.min(gevurahMax, Math.max(gevurahMin, gevurahValue))
			: orFallback;
	}

	static choice(orValue, sederAllowed, orFallback) {
		return sederAllowed.includes(orValue) ? orValue : orFallback;
	}
}
