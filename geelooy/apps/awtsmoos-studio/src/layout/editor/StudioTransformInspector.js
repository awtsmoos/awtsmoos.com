//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTransformInspector.js
 * The Awtsmoos renews every axis while Awtsmoos.com gives a selected object precise XYZ move, rotation, scale, and opacity vessels;
 * numbers and finger nudges share the same canonical transform, so inspector and viewport gizmo never become competing levels.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioLayer } from '../../editor/StudioLayerAccess.js';
import { defaultTransform } from '../../editor/StudioLayerFactory.js';
import { STUDIO_TRANSFORM_FIELDS } from '../../editor/StudioTransformFields.js';

/** Build the contextual numeric transform controls for the selected canonical layer. */
export function createStudioTransformInspector() {
	return UI.div(
		{ class: 'studio-transform-inspector' },
		UI.div(
			{ class: 'studio-inspector-section-title' },
			UI.strong({ text: 'Transform' }),
			UI.button({ class: 'studio-mini-button', text: 'Reset', $on: { click: 'resetLayerTransform' } })
		),
		UI.div(
			{ class: 'studio-transform-grid' },
			...STUDIO_TRANSFORM_FIELDS.map(item => transformField(item))
		)
	);
}

function transformField(item) {
	return UI.label(
		{ class: 'studio-transform-field' },
		UI.span({ class: 'studio-transform-label', text: item.label }),
		UI.div(
			{ class: 'studio-transform-control' },
			nudgeButton('−', item.key, -item.step),
			UI.input({
				type: 'number',
				step: item.step,
				'data-transform-field': item.key,
				value: context => selectedTransform(context)[item.key],
				$on: { change: 'updateLayerTransform' }
			}),
			nudgeButton('+', item.key, item.step)
		)
	);
}

function nudgeButton(text, key, delta) {
	return UI.button({
		class: 'studio-nudge-button',
		text,
		'data-transform-field': key,
		'data-transform-delta': delta,
		$on: { click: 'nudgeLayerTransform' }
	});
}

function selectedTransform(context) {
	const layer = getStudioLayer(
		context.store.get('movie'),
		context.store.get('selectedSceneId'),
		context.store.get('selectedLayerId')
	);
	return { ...defaultTransform(), ...(layer?.transform || {}) };
}
