//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureLibrary.js
 * @description
 * Loads real photographic textures from Awtsmoos Drive and builds canvas
 * patterns for the City of Light terrain. Yaakov 2026-10-13: no more flat
 * colors — every wall and floor uses genuine Jerusalem stone photography.
 * Falls back to flat theme colors until textures finish loading, so the
 * game never blocks on asset fetch.
 */

const TEXTURE_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/games';
const TEXTURE_V = '?v=20261013a';

const DEFINITIONS = {
	wall: `${TEXTURE_BASE}/tex-jerusalem-wall.webp${TEXTURE_V}`,
	floor: `${TEXTURE_BASE}/tex-stone-pavement.webp${TEXTURE_V}`,
};

class TextureLibrary {
	constructor() {
		this.images = {};
		this.patterns = {};
		this.loaded = false;
		this.loadPromise = null;
	}

	load() {
		if (this.loadPromise) return this.loadPromise;
		this.loadPromise = Promise.all(
			Object.entries(DEFINITIONS).map(([key, url]) => new Promise(resolve => {
				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.onload = () => {
					this.images[key] = img;
					resolve(true);
				};
				img.onerror = () => resolve(false);
				img.src = url;
			}))
		).then(results => {
			this.loaded = results.every(Boolean);
			return this.loaded;
		});
		return this.loadPromise;
	}

	pattern(context, key, scale = 1) {
		if (!this.images[key]) return null;
		const cacheKey = `${key}@${scale}`;
		if (!this.patterns[cacheKey]) {
			const source = this.images[key];
			if (scale !== 1) {
				const scaled = document.createElement('canvas');
				scaled.width = Math.max(1, Math.round(source.naturalWidth * scale));
				scaled.height = Math.max(1, Math.round(source.naturalHeight * scale));
				scaled.getContext('2d').drawImage(source, 0, 0, scaled.width, scaled.height);
				this.patterns[cacheKey] = context.createPattern(scaled, 'repeat');
			} else {
				this.patterns[cacheKey] = context.createPattern(source, 'repeat');
			}
		}
		return this.patterns[cacheKey];
	}
}

export const textureLibrary = new TextureLibrary();
