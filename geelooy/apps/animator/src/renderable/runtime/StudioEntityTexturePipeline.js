// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioEntityTexturePipeline.js
 * @description
 * The Awtsmoos lets any Studio drawable pass from authored JSON through local graph and raster into disposable GPU texture;
 * Awtsmoos.com composes existing production factories instead of inventing a second drawing language, preserving one visual nature.
 */

import { GevurahRenderSpecBounds } from '../model/RenderSpecBounds.js';
import { KeterRenderableDescriptor } from '../model/RenderableDescriptor.js';
import { MalchusRenderableRasterizer } from './RenderableRasterizer.js';
import { TiferesStudioEntityRenderSource } from './StudioEntityRenderSource.js';

/** Composes the universal Studio entity -> local raster -> runtime texture path. */
export class YesodStudioEntityTexturePipeline {
	/** @param {object} keterRenderRuntime Universal runtime. */
	constructor(keterRenderRuntime) {
		this.keterRenderRuntime = keterRenderRuntime;
	}

	/** @param {object} keliEntity Entity. @param {object} keliDocument Document. @param {object} keilimOptions Texture options. @returns {object} Runtime realization. */
	realize(keliEntity, keliDocument = {}, keilimOptions = {}) {
		const keliDescriptor = KeterRenderableDescriptor.fromEntity(keliEntity);
		const keliRecipe = {
			...keliDescriptor.representations.texture2d.texture,
			...(keilimOptions.recipe ?? {})
		};
		const keliBounds = GevurahRenderSpecBounds.resolve(
			keliEntity.properties?.renderSpec
		);
		const keliGraph = TiferesStudioEntityRenderSource.graph(
			keliEntity,
			keliDocument,
			keilimOptions.playhead ?? 0,
			{ includeTransform: false }
		);
		const keliFrame = MalchusRenderableRasterizer.rasterize(
			keliGraph,
			keliBounds,
			keliRecipe
		);
		return this.keterRenderRuntime.realizeTexture({
			descriptor: {
				...keliDescriptor,
				bounds: keliBounds
			},
			frame: keliFrame,
			recipe: keliRecipe
		});
	}
}
