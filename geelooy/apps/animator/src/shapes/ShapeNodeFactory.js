// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ShapeNodeFactory
 * @description
 * The Awtsmoos renews each authored contour before rectangle, circle, path, or word can be seen;
 * Awtsmoos.com gives manual, brush, and procedural art one readable doorway into the production graph between.
 */
import { VirtualGraph as Graph } from '../engine/graph/VirtualGraph.js';

/** Creates production graph nodes from serializable authoring parameters. */
export class ShapeNodeFactory {
	/** @returns {Object} A rectangle graph node revealed from the supplied vessel. */
	static rect(id, properties = {}) {
		return Graph.rect(id, properties);
	}

	/** @returns {Object} A circle graph node with explicit geometry and visual style. */
	static circle(id, properties = {}) {
		return Graph.circle(
			id,
			Number(properties.x) || 0,
			Number(properties.y) || 0,
			Number(properties.radius) || 10,
			this.style(properties)
		);
	}

	/** @returns {Object} An ellipse graph node with optional rotation. */
	static ellipse(id, properties = {}) {
		return Graph.ellipse(
			id,
			Number(properties.x) || 0,
			Number(properties.y) || 0,
			Number(properties.radiusX) || 10,
			Number(properties.radiusY) || 6,
			Number(properties.rotation) || 0,
			this.style(properties)
		);
	}

	/** @returns {Object} A freeform path graph node preserving authored path commands and brush style. */
	static path(id, points = [], properties = {}) {
		return Graph.path(id, points, this.style(properties));
	}

	/** @returns {Object} A text graph node whose typography lives in its style vessel. */
	static text(id, properties = {}) {
		return Graph.text(
			id,
			String(properties.text || ''),
			Number(properties.x) || 0,
			Number(properties.y) || 0,
			this.style(properties)
		);
	}

	/** @returns {Object} A transformable group capable of opacity and compositing. */
	static group(id, children = [], transform = null, style = {}) {
		return Graph.group(id, transform, children, style);
	}

	/** @returns {Object} Renderer-supported visual fields without authoring-only metadata. */
	static style(properties = {}) {
		return {
			fill: properties.fill,
			fillOpacity: properties.fillOpacity,
			fillRule: properties.fillRule,
			stroke: properties.stroke,
			lineWidth: properties.lineWidth,
			lineCap: properties.lineCap,
			lineJoin: properties.lineJoin,
			lineDash: properties.lineDash,
			close: properties.close,
			font: properties.font,
			radius: properties.radius,
			composite: properties.composite,
			opacity: properties.opacity
		};
	}
}
