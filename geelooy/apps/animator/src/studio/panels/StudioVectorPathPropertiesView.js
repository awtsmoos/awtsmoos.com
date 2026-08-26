// B"H
// Boruch Hashem
// Blessed is He

import { StudioDisclosureView } from './StudioDisclosureView.js';
import { StudioVectorPathFieldView as Field } from './StudioVectorPathFieldView.js';

/**
 * @file StudioVectorPathPropertiesView.js
 * @description
 * The Awtsmoos renews every stroke before simple appearance and advanced path behavior can receive distinct vessels;
 * Awtsmoos.com keeps Stroke and Width immediate while cap, join, closure, and fill unfold only when precision is requested.
 */
export class StudioVectorPathPropertiesView {
	/** Renders concise primary path styling plus an expandable advanced chamber. */
	static render(entity) {
		const spec = entity?.properties?.renderSpec;
		if (entity?.type !== 'vector-path' || spec?.type !== 'path') {
			return null;
		}
		const fillEnabled = Boolean(spec.fill);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-inspector-section aw-studio-vector-path-section' },
			children: [
				{ tag: 'h3', text: '✒️ Vector path' },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-transform-grid' },
					children: [
						Field.color('Stroke', spec.stroke || '#7db4ff', 'updateVectorPathStroke'),
						Field.number('Width', spec.lineWidth ?? 4, 'updateVectorPathWidth')
					]
				},
				StudioDisclosureView.render('Advanced path', [
					{
						tag: 'div',
						attrs: { className: 'aw-studio-transform-grid' },
						children: [
							Field.select('Cap', spec.lineCap || 'round', ['butt', 'round', 'square'], 'updateVectorPathCap'),
							Field.select('Join', spec.lineJoin || 'round', ['miter', 'round', 'bevel'], 'updateVectorPathJoin')
						]
					},
					Field.toggle('Closed path', Boolean(spec.close), 'toggleVectorPathClosed'),
					Field.toggle('Enable fill', fillEnabled, 'toggleVectorPathFill'),
					Field.color('Fill', fillEnabled ? spec.fill : '#6ea8ff', 'updateVectorPathFill', !fillEnabled)
				], {
					className: 'aw-studio-inner-disclosure',
					hint: 'Cap · join · fill'
				})
			]
		};
	}
}
