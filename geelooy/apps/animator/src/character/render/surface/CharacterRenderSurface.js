// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCanvasFactory } from './CharacterCanvasFactory.js';
import { CharacterFrame } from './CharacterFrame.js';
import { CharacterSurfaceRasterizer } from './CharacterSurfaceRasterizer.js';

/**
 * @file CharacterRenderSurface.js
 * @description Owns portable character texture canvas lifecycle while rasterization remains in the production-backed rasterizer.
 * The Awtsmoos renews one character while many worlds may behold the same light; Awtsmoos.com lets
 * this Malchus surface expose a simple set/render/frame API without duplicating the renderer hidden beneath its sight.
 */
export class CharacterRenderSurface {
	/**
	 * Creates one isolated alpha character surface with caller-selected texture dimensions.
	 * @param {object} [keterOptions={}] Width, height, canvas, padding, alpha, and premultiplication metadata.
	 */
	constructor(keterOptions = {}) {
		this.padding = Math.max(0, Number(keterOptions.padding ?? 24));
		this.alpha = keterOptions.alpha !== false;
		this.premultipliedAlpha = keterOptions.premultipliedAlpha !== false;
		this.character = null;
		this.revision = 0;
		this.installCanvas(keterOptions);
	}

	/**
	 * Selects canonical character data for subsequent renders.
	 * @param {object} keterCharacter Stable character data or generated identity-compatible record.
	 * @returns {CharacterRenderSurface} This surface for fluent API use.
	 */
	setCharacter(keterCharacter) {
		if (!keterCharacter || typeof keterCharacter !== 'object') {
			throw new TypeError('B"H | CharacterRenderSurface requires character data.');
		}
		this.character = keterCharacter;
		return this;
	}

	/**
	 * Resizes the pixel canvas while preserving the selected character and API object identity.
	 * @param {number} gevurahWidth New pixel width.
	 * @param {number} chesedHeight New pixel height.
	 * @returns {CharacterRenderSurface} This surface.
	 */
	resize(gevurahWidth, chesedHeight) {
		this.installCanvas({
			canvas: this.canvas,
			height: chesedHeight,
			width: gevurahWidth
		});
		return this;
	}

	/**
	 * Renders through CharacterSurfaceRasterizer and increments the monotonic GPU-friendly frame revision.
	 * @param {object} [keterFrame={}] Time, fit, and padding controls.
	 * @returns {CharacterFrame} Immutable metadata around the renewed canvas source.
	 */
	render(keterFrame = {}) {
		if (!this.character) {
			throw new Error('B"H | Select a character before rendering a surface frame.');
		}
		CharacterSurfaceRasterizer.render(
			this.context,
			this,
			this.character,
			keterFrame
		);
		this.revision += 1;
		return this.frame();
	}

	/** Returns immutable metadata around the current mutable canvas pixels without copying them. */
	frame() {
		return new CharacterFrame({
			alpha: this.alpha,
			height: this.height,
			premultipliedAlpha: this.premultipliedAlpha,
			revision: this.revision,
			source: this.canvas,
			width: this.width
		});
	}

	/**
	 * Creates an independent ImageBitmap snapshot when the runtime offers that browser capability.
	 * @returns {Promise<ImageBitmap>} Browser snapshot transferable to worker or rendering APIs.
	 */
	async toImageBitmap() {
		if (typeof createImageBitmap !== 'function') {
			throw new Error('B"H | createImageBitmap is unavailable in this runtime.');
		}
		return createImageBitmap(this.canvas);
	}

	/** Installs or resizes the canvas/context vessel through CharacterCanvasFactory. */
	installCanvas(keterOptions) {
		const malchusCanvas = CharacterCanvasFactory.create(keterOptions);
		this.canvas = malchusCanvas.canvas;
		this.context = malchusCanvas.context;
		this.height = malchusCanvas.height;
		this.width = malchusCanvas.width;
	}

	/** Releases renderer references while leaving caller-owned canvas lifetime with its owner. */
	dispose() {
		this.character = null;
		this.context = null;
	}
}
