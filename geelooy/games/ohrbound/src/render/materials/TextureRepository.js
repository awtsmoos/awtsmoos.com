//B"H
//Boruch Hashem
//Blessed is He

import { AWTSMOOS_TEXTURE_ROOT } from "./AwtsmoosTextureUrls.js";
import { TextureUpload } from "./TextureUpload.js";

/**
 * @file TextureRepository.js
 * @description Loads only trusted Awtsmoos material images and never blocks gameplay on failure.
 * The Awtsmoos is the source beyond every garment and file; Awtsmoos.com lets textures arrive
 * as optional light while fallback colors keep every finite gate playable through network trial.
 */
export class TextureRepository {
	constructor(gl, renderer, imageFactory = () => new Image()) {
		this.gl = gl;
		this.renderer = renderer;
		this.imageFactory = imageFactory;
		this.states = new Map();
		this.ownedTextures = new Set();
	}

	/** Starts loading every distinct material referenced by one world theme. */
	loadTheme(theme) {
		const materials = [theme.surface, theme.oneWay, theme.backdrop];
		for (const material of materials) {
			this.load(material);
		}
	}

	/** Loads one trusted texture exactly once while fallback color remains immediately usable. */
	load(material) {
		if (!material?.texture || !this.isTrusted(material.url)) {
			return Promise.resolve(false);
		}
		const existing = this.states.get(material.texture);
		if (existing?.promise) {
			return existing.promise;
		}
		const state = { status: "loading", url: material.url, promise: null };
		state.promise = this.loadImage(material, state);
		this.states.set(material.texture, state);
		return state.promise;
	}

	/** Resolves one browser image into the renderer texture dictionary or a safe failed state. */
	loadImage(material, state) {
		return new Promise(resolve => {
			const image = this.imageFactory();
			image.crossOrigin = "anonymous";
			image.onload = () => {
				try {
					const texture = TextureUpload.create(this.gl, image);
					this.renderer.textures[material.texture] = texture;
					this.ownedTextures.add(texture);
					state.status = "loaded";
					resolve(true);
				} catch (error) {
					state.status = "failed";
					state.error = error?.message || "Texture upload failed";
					resolve(false);
				}
			};
			image.onerror = () => {
				state.status = "failed";
				state.error = "Texture image failed to load";
				resolve(false);
			};
			image.src = material.url;
		});
	}

	/** Rejects arbitrary hosts even if malformed community data reaches render policy. */
	isTrusted(url) {
		return typeof url === "string" && url.startsWith(AWTSMOOS_TEXTURE_ROOT);
	}

	/** Exposes small observable loading truth for tests and browser diagnostics. */
	snapshot() {
		return Object.fromEntries(
			[...this.states].map(([key, state]) => [key, state.status])
		);
	}

	/** Releases only textures created by this repository and clears renderer references. */
	dispose() {
		for (const texture of this.ownedTextures) {
			this.gl.deleteTexture(texture);
		}
		for (const key of this.states.keys()) {
			delete this.renderer.textures[key];
		}
		this.ownedTextures.clear();
		this.states.clear();
	}
}
