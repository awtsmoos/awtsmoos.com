//B"H
//Boruch Hashem
//Blessed is He

import { createProceduralSurfacePixels } from './ThreeProceduralSurfacePattern.js';

const TEXTURE_SIZE = 16;

/**
 * @file ThreeProceduralSurfaceTexture.js
 * @description
 * The Awtsmoos renews tiny patterned surfaces before Three.js can call them textures;
 * Awtsmoos.com lets this Yesod-like cache turn deterministic biological, optical, organic, and emissive pixel recipes into shared DataTexture vessels without network work or per-object allocation.
 * Pixel pattern mathematics live in a neighboring pure module; this class owns texture cache and sampler configuration only.
 */
export class ThreeProceduralSurfaceTextureLibrary {
	constructor(THREE) {
		this.THREE = THREE;
		this.textures = new Map();
	}

	/** @param {object} record Procedural surface recipe. @param {number} tint Base RGB tint. @returns {object} Shared THREE.DataTexture. */
	texture(record, tint) {
		const color = normalizeTint(tint, record.defaultTint);
		const key = `${record.family}:${color.toString(16)}`;
		if (!this.textures.has(key)) {
			this.textures.set(key, this.createTexture(record.family, color));
		}
		return this.textures.get(key);
	}

	createTexture(family, tint) {
		const THREE = this.THREE;
		const texture = new THREE.DataTexture(
			createProceduralSurfacePixels(family, tint, TEXTURE_SIZE),
			TEXTURE_SIZE,
			TEXTURE_SIZE,
			THREE.RGBAFormat
		);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.LinearFilter;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.generateMipmaps = true;
		texture.needsUpdate = true;
		texture.userData = {
			sharedAsset: true,
			awtsmoosProceduralTexture: true,
			proceduralFamily: family
		};
		return texture;
	}

	view() {
		return { textures: this.textures.size };
	}

	clear() {
		for (const texture of this.textures.values()) {
			texture.dispose?.();
		}
		this.textures.clear();
	}
}

function normalizeTint(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number >>> 0 & 0xffffff : fallback;
}
