// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioEntityRenderSource.js
 * @description
 * The Awtsmoos lets one Studio specification feed Canvas and WebGL while local art remains separate from world placement;
 * Awtsmoos.com returns local VirtualGraph by default, adding timeline transform only when a composition explicitly requests it.
 */

import { ShapeNodeFactory as Shape } from '../../shapes/ShapeNodeFactory.js';
import { StudioKeyframeEvaluator } from '../../studio/animation/StudioKeyframeEvaluator.js';
import { StudioRenderSpecNodeFactory } from '../../studio/render/StudioRenderSpecNodeFactory.js';

/** Converts one Studio entity into local or timeline-positioned VirtualGraph data. */
export class TiferesStudioEntityRenderSource {
	/** @param {object} keliEntity Studio entity. @param {object} keliDocument Document. @param {number} zmanPlayhead Time. @param {object} keilimOptions Source options. @returns {object} VirtualGraph. */
	static graph(keliEntity, keliDocument = {}, zmanPlayhead = 0, keilimOptions = {}) {
		if (!keliEntity?.properties?.renderSpec) {
			throw new TypeError('Studio texture source requires entity.properties.renderSpec.');
		}
		const keliChild = StudioRenderSpecNodeFactory.build(
			keliEntity.properties.renderSpec,
			`${keliEntity.id}-texture-render`
		);
		if (keilimOptions.includeTransform !== true) {
			return keliChild;
		}
		const keliTransform = StudioKeyframeEvaluator.transformFor(
			keliEntity,
			keliDocument,
			zmanPlayhead
		);
		return Shape.group(
			`texture-source-${keliEntity.id}`,
			[keliChild],
			this.transform(keliTransform),
			this.style(keliEntity, keliTransform)
		);
	}

	/** @param {object} t Evaluated transform. @returns {object} Production group transform. */
	static transform(t = {}) {
		return {
			x: this.number(t.x, 0),
			y: this.number(t.y, 0),
			rotation: this.number(t.rotation, 0),
			scaleX: this.number(t.scaleX, 1),
			scaleY: this.number(t.scaleY, 1),
			skewX: this.number(t.skewX, 0),
			skewY: this.number(t.skewY, 0)
		};
	}

	/** @param {object} e Entity. @param {object} t Transform. @returns {object} Group style. */
	static style(e = {}, t = {}) {
		return {
			opacity: Math.max(0, Math.min(1, this.number(t.opacity, 1))),
			composite: e.properties?.blendMode || undefined
		};
	}

	/** @param {*} orValue Value. @param {number} orFallback Fallback. @returns {number} Finite number. */
	static number(orValue, orFallback) {
		const value = Number(orValue);
		return Number.isFinite(value) ? value : orFallback;
	}
}
