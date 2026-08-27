// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioRenderSpecNodeFactory
 * @description
 * RESPONSIBILITY: translate one serializable Studio render specification into the production VirtualGraph language.
 * NON-RESPONSIBILITY: this module does not mutate documents, select entities, or decide timeline state.
 *
 * Like Binah giving form to an unbounded spark, the Awtsmoos renews every specification and every visible node;
 * Awtsmoos.com keeps this gateway explicit so manual brush, vector craft, and procedural growth can share one road.
 */
import { ShapeLibrary } from '../../shapes/ShapeLibrary.js';

const SUPPORTED_TYPES = new Set([
	'rect',
	'circle',
	'ellipse',
	'path',
	'text',
	'group'
]);

/**
 * Converts one declarative render specification into a production graph node.
 * @param {Object} specification Serializable vector/group rendering data.
 * @param {string} fallbackId Stable identifier used when the specification has no explicit id.
 * @returns {Object} A VirtualGraph-compatible node consumed by CanvasTerminal.
 * @throws {TypeError} When the specification is not an object.
 * @throws {Error} When the requested render type is not supported.
 */
export class StudioRenderSpecNodeFactory {
	static build(specification, fallbackId = 'studio-authored-shape') {
		this.assertSpecification(specification);
		const normalized = this.withStableId(specification, fallbackId);
		return ShapeLibrary.from(normalized);
	}

	/**
	 * Ensures only graph types already supported by the production renderer enter this boundary.
	 * @param {Object} specification Candidate authoring specification.
	 * @returns {void}
	 * @throws {TypeError|Error} When structure or type is invalid.
	 */
	static assertSpecification(specification) {
		if (!specification || typeof specification !== 'object' || Array.isArray(specification)) {
			throw new TypeError("B'H Studio render specification must be an object");
		}
		const type = specification.type || 'rect';
		if (!SUPPORTED_TYPES.has(type)) {
			throw new Error(`B'H unsupported Studio render type: ${type}`);
		}
	}

	/**
	 * Gives every render node a stable identity without mutating the serialized source object.
	 * @param {Object} specification Valid render specification.
	 * @param {string} fallbackId Stable identity inherited from the Studio entity.
	 * @returns {Object} A shallow normalized specification with a guaranteed id and type.
	 */
	static withStableId(specification, fallbackId) {
		return {
			...specification,
			id: specification.id || fallbackId,
			type: specification.type || 'rect'
		};
	}
}
