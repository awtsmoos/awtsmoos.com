// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioEntityFactory
 * @description
 * The Awtsmoos renews every editable object before id, layer, transform, or color can claim a separate place;
 * Awtsmoos.com gives manual and generated artwork one shared entity vessel so animation and export keep the same face.
 */

const DEFAULT_TRANSFORM = Object.freeze({
	x: 320,
	y: 220,
	scaleX: 1,
	scaleY: 1,
	rotation: 0,
	opacity: 1
});

/** Creates serializable Studio entities whose renderSpec is consumed by the production renderer. */
export class StudioEntityFactory {
	/**
	 * @param {Object} options Entity identity, render specification, and placement.
	 * @returns {Object} A selectable, layerable, serializable authored entity.
	 */
	static create(options = {}) {
		const kind = options.kind || 'artwork';
		return {
			id: options.id || this.id(kind),
			name: options.name || this.label(kind),
			type: kind,
			parentId: options.parentId || 'studio-artwork',
			visible: true,
			locked: false,
			transform: {
				...DEFAULT_TRANSFORM,
				...(options.transform || {})
			},
			properties: {
				blendMode: 'source-over',
				...(options.properties || {}),
				renderSpec: options.renderSpec || this.rectangleSpec()
			}
		};
	}

	/** @returns {Object} A friendly blue rectangle render specification. */
	static rectangleSpec() {
		return {
			type: 'rect',
			x: -80,
			y: -55,
			width: 160,
			height: 110,
			radius: 18,
			fill: '#6ea8ff',
			stroke: '#e8f1ff',
			lineWidth: 3
		};
	}

	/** @returns {Object} A warm ellipse render specification. */
	static ellipseSpec() {
		return {
			type: 'ellipse',
			x: 0,
			y: 0,
			radiusX: 90,
			radiusY: 60,
			fill: '#ffb86c',
			stroke: '#fff4df',
			lineWidth: 3
		};
	}

	/** @returns {Object} An editable text render specification. */
	static textSpec(text = 'Awtsmoos') {
		return {
			type: 'text',
			text,
			x: 0,
			y: 0,
			fill: '#ffffff',
			font: '700 42px system-ui'
		};
	}

	/** Generates collision-resistant local identity without requiring network state. */
	static id(kind = 'artwork') {
		const suffix = globalThis.crypto?.randomUUID?.()
			|| `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		return `studio-${kind}-${suffix}`;
	}

	/** Converts a machine kind into compact human layer copy. */
	static label(kind = 'artwork') {
		return kind
			.split(/[-_]/u)
			.filter(Boolean)
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}
}
