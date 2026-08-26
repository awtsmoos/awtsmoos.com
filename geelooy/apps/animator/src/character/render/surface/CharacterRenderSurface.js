// B"H
// Boruch Hashem
// Blessed is He

import { StableCharacterRenderAdapter } from '../../factory/stable/StableCharacterRenderAdapter.js';
import { CanvasTerminal } from '../../../engine/renderer/CanvasTerminal.js';
import { CharacterCanvasFactory } from './CharacterCanvasFactory.js';
import { CharacterFrame } from './CharacterFrame.js';
import { CharacterSurfaceViewport } from './CharacterSurfaceViewport.js';

/**
 * @file CharacterRenderSurface.js
 * @description Renders the canonical production character graph into one portable alpha canvas for Studio or external engines.
 * The Awtsmoos renews one character while many worlds may behold the same light; Awtsmoos.com lets
 * this Tiferes surface reuse the production adapter and CanvasTerminal so WebGL texture use never becomes a second renderer.
 */
export class CharacterRenderSurface {
	/**
	 * Creates one isolated character surface with caller-selected texture dimensions.
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
	 * Selects the canonical character data rendered by subsequent frame calls.
	 * @param {object} keterCharacter Stable character data or generated identity-compatible record.
	 * @returns {CharacterRenderSurface} This surface for fluent external API use.
	 */
	setCharacter(keterCharacter) {
		if (!keterCharacter || typeof keterCharacter !== 'object') {
			throw new TypeError('B"H | CharacterRenderSurface requires character data.');
		}
		this.character = keterCharacter;
		return this;
	}

	/**
	 * Resizes the texture canvas; browser canvas semantics intentionally clear prior pixels.
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
	 * Renders one frame through the same stable adapter and CanvasTerminal used by production Studio rendering.
	 * @param {object} [keterFrame={}] Render time and optional fit/padding controls.
	 * @returns {CharacterFrame} Immutable metadata around the renewed canvas image source.
	 */
	render(keterFrame = {}) {
		if (!this.character) {
			throw new Error('B"H | Select a character before rendering a surface frame.');
		}
		const tiferesCharacter = frameCharacter(this.character, keterFrame.time);
		const orResult = StableCharacterRenderAdapter.render(tiferesCharacter);
		if (!orResult?.node) {
			throw new Error('B"H | The canonical character renderer produced no frame node.');
		}
		this.clear();
		this.context.save();
		if (keterFrame.fit !== false) {
			CharacterSurfaceViewport.apply(
				this.context,
				CharacterSurfaceViewport.fit(
					orResult.bounds,
					this,
					keterFrame.padding ?? this.padding
				)
			);
		}
		CanvasTerminal.render(this.context, orResult.node);
		this.context.restore();
		this.revision += 1;
		return this.frame();
	}

	/**
	 * Returns immutable metadata around the current mutable canvas pixels without copying them.
	 * @returns {CharacterFrame} Current frame view.
	 */
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
	 * Creates an ImageBitmap snapshot when supported, useful for worker transfer or independent frame lifetime.
	 * @returns {Promise<ImageBitmap>} Browser image bitmap.
	 */
	async toImageBitmap() {
		if (typeof createImageBitmap !== 'function') {
			throw new Error('B"H | createImageBitmap is unavailable in this runtime.');
		}
		return createImageBitmap(this.canvas);
	}

	/** Clears the texture to transparent pixels using an identity transform. */
	clear() {
		this.context.save();
		this.context.setTransform?.(1, 0, 0, 1, 0, 0);
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.restore();
	}

	/** Installs or resizes the canvas/context vessel through CharacterCanvasFactory. */
	installCanvas(keterOptions) {
		const malchusCanvas = CharacterCanvasFactory.create(keterOptions);
		this.canvas = malchusCanvas.canvas;
		this.context = malchusCanvas.context;
		this.height = malchusCanvas.height;
		this.width = malchusCanvas.width;
	}

	/** Releases character/context references while leaving caller-owned canvas lifetime to its owner. */
	dispose() {
		this.character = null;
		this.context = null;
	}
}

/** Creates a frame-local shallow character record so render time never mutates canonical identity state. */
function frameCharacter(keterCharacter, orTime) {
	return {
		...keterCharacter,
		_renderTime: Number(orTime ?? keterCharacter._renderTime ?? 0),
		position: keterCharacter.position
			? { ...keterCharacter.position }
			: undefined
	};
}
