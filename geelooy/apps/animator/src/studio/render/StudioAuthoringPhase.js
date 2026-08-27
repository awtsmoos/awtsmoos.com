// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioAuthoringPhase
 * @description
 * RESPONSIBILITY: reveal Studio-authored document entities inside the production camera world at the current playhead.
 * NON-RESPONSIBILITY: this phase does not mutate documents, own selection, or create keyframes.
 *
 * The Awtsmoos renews artist, layer, keyframe, transform, and visible shape in one indivisible creative now;
 * Awtsmoos.com lets editable vessels move through the same graph used by preview and export, preserving one rendering vow.
 */
import { ShapeNodeFactory as Shape } from '../../shapes/ShapeNodeFactory.js';
import { StudioKeyframeEvaluator } from '../animation/StudioKeyframeEvaluator.js';
import { StudioRenderSpecNodeFactory } from './StudioRenderSpecNodeFactory.js';

/** Builds one production graph layer from the professional Studio document. */
export class StudioAuthoringPhase {
	/**
	 * Converts visible authored entities into one stable production group.
	 * @param {Object|null} studioState Current NLE state containing document and playhead.
	 * @returns {Object} VirtualGraph group, empty when no authored content exists.
	 */
	static build(studioState = null) {
		const document = studioState?.studioDocument || {};
		const entities = Array.isArray(document.entities) ? document.entities : [];
		const authoredIds = new Set(
			entities
				.filter(entity => Boolean(entity?.properties?.renderSpec))
				.map(entity => entity.id)
		);
		const children = entities
			.filter(entity => this.shouldRender(entity, authoredIds))
			.map(entity => this.entityNode(entity, document, studioState?.playhead || 0))
			.filter(Boolean);
		return Shape.group('studio_authoring_layer', children);
	}

	/** Keeps invisible entities and nested authored children from rendering twice. */
	static shouldRender(entity, authoredIds) {
		if (!entity?.properties?.renderSpec || entity.visible === false) {
			return false;
		}
		return !entity.parentId || !authoredIds.has(entity.parentId);
	}

	/**
	 * Wraps one render specification with its timeline-evaluated transform and layer style.
	 * @returns {Object|null} Production graph node, or null for malformed authoring data.
	 */
	static entityNode(entity, document, playhead) {
		try {
			const child = StudioRenderSpecNodeFactory.build(
				entity.properties.renderSpec,
				`${entity.id}-render`
			);
			const evaluatedTransform = StudioKeyframeEvaluator.transformFor(
				entity,
				document,
				playhead
			);
			return Shape.group(
				`studio-entity-${entity.id}`,
				[child],
				this.transform(evaluatedTransform),
				this.layerStyle(entity, evaluatedTransform)
			);
		} catch {
			return null;
		}
	}

	/** Normalizes authored transform values into the GroupRenderer contract. */
	static transform(transform = {}) {
		return {
			x: this.number(transform.x, 0),
			y: this.number(transform.y, 0),
			rotation: this.number(transform.rotation, 0),
			scaleX: this.number(transform.scaleX, 1),
			scaleY: this.number(transform.scaleY, 1),
			skewX: this.number(transform.skewX, 0),
			skewY: this.number(transform.skewY, 0)
		};
	}

	/** Returns layer-level opacity and composite mode for the group renderer. */
	static layerStyle(entity = {}, transform = {}) {
		return {
			opacity: Math.max(0, Math.min(1, this.number(transform.opacity, 1))),
			composite: entity.properties?.blendMode || undefined
		};
	}

	/** Returns a finite numeric value or the supplied fallback. */
	static number(value, fallback) {
		const number = Number(value);
		return Number.isFinite(number) ? number : fallback;
	}
}
