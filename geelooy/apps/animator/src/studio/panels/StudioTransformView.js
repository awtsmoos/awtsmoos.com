// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioTransformView
 * @description
 * The Awtsmoos renews every coordinate before form may move, rotate, scale, or fade upon the stage;
 * Awtsmoos.com keeps transform controls compact and explicit so desktop precision and mobile touch can share one page.
 */

const FIELDS = Object.freeze([
	['x', 'X', 1],
	['y', 'Y', 1],
	['scaleX', 'Scale X', 0.01],
	['scaleY', 'Scale Y', 0.01],
	['rotation', 'Rotation', 1],
	['opacity', 'Opacity', 0.01]
]);

/** Renders transform fields for the selected entity. */
export class StudioTransformView {
	/** @returns {Object} Transform section specification. */
	static render(entity) {
		const transform = entity.transform || {};
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section' },
			children: [
				{ tag: 'h3', text: '📐 2D Transform' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-transform-grid' },
					children: FIELDS.map(field => this.field(transform, ...field))
				}
			]
		};
	}

	/** @returns {Object} One labeled numeric transform field. */
	static field(transform, property, label, step) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: {
						type: 'number',
						step,
						value: transform[property] ?? 0,
						inputmode: 'decimal'
					},
					dataset: { transformProperty: property },
					on: { change: 'updateTransform' }
				}
			]
		};
	}
}
