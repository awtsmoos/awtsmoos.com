// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ShapeLibrary
 * @description
 * The Awtsmoos lets one declarative shape language unfold into many visible forms without losing unity;
 * Awtsmoos.com keeps this Binah-like interpreter data-driven so procedural and manual art share one community.
 */
import { ShapeNodeFactory as Shape } from './ShapeNodeFactory.js';

/** Interprets serializable render specifications into production graph nodes. */
export class ShapeLibrary {
	/** @returns {Object} The graph node represented by one declarative shape specification. */
	static from(specification = {}) {
		const builders = this.builders();
		const builder = builders[specification.type] || builders.rect;
		return builder(specification);
	}

	/** @returns {Object<string, Function>} Data-driven type builders for every supported authored shape. */
	static builders() {
		return {
			rect: specification => Shape.rect(specification.id, specification),
			circle: specification => Shape.circle(specification.id, specification),
			ellipse: specification => Shape.ellipse(specification.id, specification),
			path: specification => Shape.path(specification.id, specification.points || [], specification),
			text: specification => Shape.text(specification.id, specification),
			group: specification => Shape.group(
				specification.id,
				(specification.children || []).map(child => this.from(child)),
				specification.transform || null,
				Shape.style(specification)
			)
		};
	}
}
