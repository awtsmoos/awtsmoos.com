// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UniversalRenderRuntime.js
 * @description
 * The Awtsmoos lets one renderable descriptor become Canvas raster, WebGL texture, and future representation through one runtime center;
 * Awtsmoos.com composes disposable GPU services around durable recipes so context, cache, and memory never become document owners.
 */

import { MalchusRepresentationRegistry } from './RepresentationRegistry.js';
import { GevurahWebGLTextureCache } from '../webgl/WebGLTextureCache.js';
import { NetzachWebGLContextLifecycle } from '../webgl/WebGLContextLifecycle.js';
import { BinahWebGLRuntimeFactory } from '../webgl/WebGLRuntimeFactory.js';
import { YesodWebGLTextureRealizer } from '../webgl/WebGLTextureRealizer.js';
import { ChochmahWebGLCapabilities } from '../webgl/WebGLCapabilities.js';

/** Owns runtime-only rendering backends and exposes JSON-safe status around disposable GPU resources. */
export class KeterUniversalRenderRuntime {
	/** @param {object} keilimOptions Runtime options including texture memory budget. */
	constructor(keilimOptions = {}) {
		this.representations = new MalchusRepresentationRegistry();
		this.textureCache = new GevurahWebGLTextureCache(
			keilimOptions.textureBudgetBytes
		);
		const keliGpu = BinahWebGLRuntimeFactory.create(keilimOptions);
		this.canvas = keliGpu.canvas;
		this.gl = keliGpu.gl;
		this.lifecycle = this.gl
			? new NetzachWebGLContextLifecycle(this.canvas, this.textureCache)
			: null;
		this.installAdapters();
	}

	/** Registers currently available runtime representation adapters. */
	installAdapters() {
		if (!this.gl) return;
		const yesodTexture = new YesodWebGLTextureRealizer(
			this.gl,
			this.textureCache
		);
		this.representations.register('texture2d', yesodTexture);
	}

	/** @param {object} keliInput Texture realization input. @returns {object} Runtime texture result. */
	realizeTexture(keliInput) {
		if (!this.gl || this.lifecycle?.lost) {
			throw this.environmentError('WebGL texture realization is unavailable.');
		}
		return this.representations.realize('texture2d', keliInput);
	}

	/** @returns {object} JSON-safe render backend and memory status. */
	status() {
		return {
			capabilities: ChochmahWebGLCapabilities.inspect(this.gl),
			memory: this.textureCache.stats(),
			lifecycle: this.lifecycle?.status() ?? {
				lost: false,
				recovery: 'unavailable'
			},
			representations: this.representations.kinds()
		};
	}

	/** Clears disposable GPU resources while preserving every durable recipe. */
	release() {
		this.textureCache.clear(true);
	}

	/** Detaches lifecycle observers and deletes cached GPU textures. */
	dispose() {
		this.release();
		this.lifecycle?.dispose();
	}

	/** @param {string} orMessage Failure message. @returns {Error} Stable environment error. */
	environmentError(orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = 'environment_unavailable';
		return gevurahError;
	}
}
