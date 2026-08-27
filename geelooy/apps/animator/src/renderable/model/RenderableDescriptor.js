// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderableDescriptor.js
 * @description
 * The Awtsmoos lets every authored entity inherit texture capability without forcing old documents to be rewritten at once;
 * Awtsmoos.com projects extensible Studio JSON into one renderable descriptor whose defaults preserve Canvas and awaken GPU choice.
 */

import { ChochmahRepresentationRecipe } from './RepresentationRecipe.js';
import { BinahRenderableRevision } from './RenderableRevision.js';
import { TiferesRenderableTraits } from './RenderableTraits.js';

/** Projects existing Studio entities into universal backend-neutral renderable descriptors. */
export class KeterRenderableDescriptor {
	/** @param {object} keliEntity Studio entity. @returns {object} Detached universal renderable descriptor. */
	static fromEntity(keliEntity = {}) {
		const keliAuthored = keliEntity.renderable ?? {};
		const sodRevision = Number.isInteger(keliAuthored.revision)
			? keliAuthored.revision
			: BinahRenderableRevision.fromValue(keliEntity);
		return {
			version: 1,
			objectId: String(keliEntity.id ?? ''),
			revision: Math.max(0, sodRevision),
			traits: TiferesRenderableTraits.normalize([
				...TiferesRenderableTraits.drawableDefaults(),
				...(keliAuthored.traits ?? [])
			]),
			bounds: this.bounds(keliEntity, keliAuthored.bounds),
			tags: this.strings(keliAuthored.tags ?? keliEntity.tags),
			dependencies: this.strings(keliAuthored.dependencies),
			representations: ChochmahRepresentationRecipe.defaults(
				keliAuthored.representations ?? {}
			)
		};
	}

	/** @param {object} keliEntity Entity. @param {object} keliBounds Authored bounds. @returns {object} Normalized bounds. */
	static bounds(keliEntity, keliBounds = {}) {
		const keliProperties = keliEntity.properties ?? {};
		const keliTransform = keliEntity.transform ?? {};
		return {
			x: Number(keliBounds.x ?? keliTransform.x) || 0,
			y: Number(keliBounds.y ?? keliTransform.y) || 0,
			width: Math.max(0, Number(keliBounds.width ?? keliProperties.width) || 0),
			height: Math.max(0, Number(keliBounds.height ?? keliProperties.height) || 0)
		};
	}

	/** @param {*} orValue Candidate string array. @returns {string[]} Unique stable strings. */
	static strings(orValue) {
		if (!Array.isArray(orValue)) return [];
		return [...new Set(orValue.map(String).filter(Boolean))].sort();
	}
}
