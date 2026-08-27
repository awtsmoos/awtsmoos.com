// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WebGLTextureRealizer.js
 * @description
 * The Awtsmoos lets a prepared 2D raster become temporary GPU light while authored identity remains untouched above;
 * Awtsmoos.com preserves host WebGL state and trusts the raster's real dimensions, keeping quality scaling in its proper flow.
 */

import { WebGLPixelStoreState } from '../../character/render/webgl/WebGLPixelStoreState.js';
import { BinahRenderableRevision } from '../model/RenderableRevision.js';
import { YesodTextureRecipe } from '../model/TextureRecipe.js';
import { GevurahWebGLTextureParameters } from './WebGLTextureParameters.js';

/** Realizes prepared CanvasImageSource frames as cached WebGL textures. */
export class YesodWebGLTextureRealizer {
	/** @param {object} kavGl WebGL context. @param {object} gevurahCache Runtime texture cache. */
	constructor(kavGl, gevurahCache) {
		if (!kavGl?.createTexture || !gevurahCache?.put) {
			throw new TypeError('WebGL texture realizer requires GL context and cache.');
		}
		this.gl = kavGl;
		this.cache = gevurahCache;
	}

	/** @param {object} keliInput Descriptor, prepared frame, and recipe. @returns {object} Runtime realization. */
	realize(keliInput = {}) {
		const keliDescriptor = keliInput.descriptor ?? {};
		const keliFrame = keliInput.frame ?? {};
		const keliRecipe = YesodTextureRecipe.normalize(keliInput.recipe);
		this.assertFrame(keliFrame);
		const sodKey = BinahRenderableRevision.cacheKey(
			keliDescriptor.objectId,
			keliDescriptor.revision,
			keliRecipe
		);
		const keliCached = this.cache.get(sodKey);
		if (keliCached) {
			return this.result(sodKey, keliCached, false);
		}
		return this.create(sodKey, keliFrame, keliRecipe);
	}

	/** @param {string} sodKey Cache key. @param {object} keliFrame Prepared frame. @param {object} keliRecipe Recipe. @returns {object} New realization. */
	create(sodKey, keliFrame, keliRecipe) {
		this.assertSize(keliFrame.width, keliFrame.height);
		const kavTexture = this.gl.createTexture();
		if (!kavTexture) throw new Error('WebGL failed to create texture.');
		const keliHost = WebGLPixelStoreState.capture(this.gl, this.gl.TEXTURE_2D);
		try {
			this.gl.bindTexture(this.gl.TEXTURE_2D, kavTexture);
			GevurahWebGLTextureParameters.apply(this.gl, keliRecipe);
			this.upload(keliFrame.source);
			if (keliRecipe.mipmaps) this.gl.generateMipmap(this.gl.TEXTURE_2D);
		} finally {
			WebGLPixelStoreState.restore(this.gl, this.gl.TEXTURE_2D, keliHost);
		}
		const gevurahBytes = this.bytes(keliFrame, keliRecipe);
		const keliEntry = this.cache.put(
			sodKey,
			kavTexture,
			{
				width: keliFrame.width,
				height: keliFrame.height,
				bytes: gevurahBytes,
				pinned: keliRecipe.pinned
			},
			(texture) => this.gl.deleteTexture?.(texture)
		);
		return this.result(sodKey, keliEntry, true);
	}

	/** @param {*} orSource CanvasImageSource. */
	upload(orSource) {
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			orSource
		);
	}

	/** @param {object} keliFrame Frame. @param {object} keliRecipe Recipe. @returns {number} Approximate bytes. */
	bytes(keliFrame, keliRecipe) {
		const gevurahBase = keliFrame.width * keliFrame.height * 4;
		return Math.ceil(gevurahBase * (keliRecipe.mipmaps ? 4 / 3 : 1));
	}

	/** @param {object} keliFrame Frame. */
	assertFrame(keliFrame) {
		if (!keliFrame.source || !Number(keliFrame.width) || !Number(keliFrame.height)) {
			throw new TypeError('Texture realization requires prepared source, width, and height.');
		}
	}

	/** @param {number} width Width. @param {number} height Height. */
	assertSize(width, height) {
		const gevurahMax = Number(this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE)) || 0;
		if (gevurahMax && (width > gevurahMax || height > gevurahMax)) {
			throw new RangeError(`Texture ${width}x${height} exceeds GPU maximum ${gevurahMax}.`);
		}
	}

	/** @param {string} sodKey Key. @param {object} keliEntry Cache entry. @param {boolean} yesodUploaded Upload flag. @returns {object} Runtime result. */
	result(sodKey, keliEntry, yesodUploaded) {
		return {
			key: sodKey,
			texture: keliEntry.texture,
			width: keliEntry.width,
			height: keliEntry.height,
			bytes: keliEntry.bytes,
			uploaded: yesodUploaded
		};
	}
}
