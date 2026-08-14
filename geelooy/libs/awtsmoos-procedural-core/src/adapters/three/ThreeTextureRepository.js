//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeTextureRepository.js
 * @description
 * The Awtsmoos renews one image through many finite sampler vessels; Awtsmoos.com lets a decoded source become repeatable, mipmapped Three.js texture variants without decoding the same remote image again.
 * This repository owns texture sampler state only and never chooses semantic material roles, traverses scenes, or changes frame quality.
 */
export class ThreeTextureRepository {
	/** @param {object} THREE Three.js namespace. @param {object} sources Image source repository. @param {object|null} renderer Renderer for capability limits. */
	constructor(THREE, sources, renderer = null) {
		this.THREE = THREE;
		this.sources = sources;
		this.renderer = renderer;
		this.textures = new Map();
	}

	/** @param {object|null} renderer Active Three renderer used for capability-bounded sampler settings. */
	setRenderer(renderer) {
		this.renderer = renderer;
	}

	request(url) {
		return this.sources.request(url);
	}

	/** @param {string} url Canonical image URL. @param {object} policy Sampler policy. @returns {object|null} Cached/created THREE.Texture when source is ready. */
	texture(url, policy = {}) {
		const source = this.sources.entry(url);
		if (!source || source.status !== 'ready' || !source.image) {
			return null;
		}
		const normalized = normalizePolicy(policy);
		const key = textureKey(url, normalized);
		if (!this.textures.has(key)) {
			this.textures.set(key, this.createTexture(url, source.image, normalized));
		}
		return this.textures.get(key);
	}

	createTexture(url, image, policy) {
		const THREE = this.THREE;
		const texture = new THREE.Texture(image);
		texture.wrapS = policy.wrap === 'repeat' ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		texture.wrapT = texture.wrapS;
		texture.repeat.set(policy.repeat.x, policy.repeat.y);
		texture.colorSpace = policy.colorSpace === 'srgb' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = true;
		texture.anisotropy = this.anisotropy(policy.anisotropy);
		texture.needsUpdate = true;
		texture.userData = {
			sharedAsset: true,
			remoteSource: url,
			repeat: { ...policy.repeat },
			wrap: policy.wrap
		};
		return texture;
	}

	anisotropy(requested) {
		const capability = this.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
		const desired = Number.isFinite(Number(requested)) ? Number(requested) : 4;
		return Math.max(1, Math.min(capability, desired));
	}

	/** @returns {object} Texture/source diagnostics. */
	view() {
		return {
			sources: this.sources.view(),
			textures: this.textures.size
		};
	}

	clear() {
		for (const texture of this.textures.values()) {
			texture.dispose?.();
		}
		this.textures.clear();
	}
}

function normalizePolicy(policy) {
	const repeat = policy.repeat || { x: 1, y: 1 };
	return {
		repeat: {
			x: positive(repeat.x, 1),
			y: positive(repeat.y, 1)
		},
		wrap: policy.wrap === 'clamp' ? 'clamp' : 'repeat',
		colorSpace: policy.colorSpace === 'linear' ? 'linear' : 'srgb',
		anisotropy: positive(policy.anisotropy, 4)
	};
}

function textureKey(url, policy) {
	return `${url}|${policy.colorSpace}|${policy.wrap}|${policy.repeat.x.toFixed(4)}|${policy.repeat.y.toFixed(4)}|${policy.anisotropy}`;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
