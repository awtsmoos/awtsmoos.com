//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioEditTransformControls.js
 * @description Turns the reference Edit sheet into real canonical Position, Rotation, Scale, and Visibility controls bound to the selected layer.
 * The Awtsmoos renews coordinate and form while Awtsmoos.com lets every slider change the same transform consumed by preview, keyframes, save, history, and export without invoking unsupported DOM helpers.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
const GROUPS = Object.freeze({
	position: [field('X', 'x', -20, 20, 0.1), field('Y', 'y', -20, 20, 0.1), field('Z', 'z', -20, 20, 0.1)],
	rotation: [field('X', 'rotationX', -180, 180, 1), field('Y', 'rotationY', -180, 180, 1), field('Z', 'rotationZ', -180, 180, 1)],
	scale: [field('X', 'scaleX', 0.1, 4, 0.05), field('Y', 'scaleY', 0.1, 4, 0.05), field('Z', 'scaleZ', 0.1, 4, 0.05)],
	visibility: [field('Opacity', 'opacity', 0, 1, 0.01)]
});
const TABS = Object.freeze([['position', '↔', 'Position'], ['rotation', '⟳', 'Rotation'], ['scale', '⤢', 'Scale'], ['visibility', '◉', 'Visibility']]);
export function createStudioEditTransformControls() {
	return UI.div({ class: 'studio-edit-transform' },
		UI.div({ class: 'studio-edit-tabs', role: 'tablist', 'aria-label': 'Transform mode' }, ...TABS.map(createTab)),
		...Object.entries(GROUPS).map(([id, fields]) => UI.div(
			{ class: 'studio-edit-field-group', hidden: context => context.store.get('editTransformMode') !== id },
			...fields.map(createRange)
		)),
		UI.button({ class: 'studio-edit-reset', type: 'button', disabled: noSelection, $on: { click: 'resetLayerTransform' }, text: 'Reset transform' })
	);
}
function createTab([id, glyph, label]) {
	return UI.button({ class: 'studio-edit-tab', type: 'button', 'data-edit-transform-mode': id,
		'aria-pressed': context => String(context.store.get('editTransformMode') === id), $on: { click: 'selectStudioEditTransformMode' } },
		UI.span({ text: glyph, 'aria-hidden': 'true' }), UI.span({ text: label }));
}
function createRange(item) {
	return UI.label({ class: 'studio-edit-range' }, UI.span({ text: item.label }),
		UI.input({ type: 'range', min: String(item.min), max: String(item.max), step: String(item.step),
			'data-transform-field': item.key, value: context => String(transformValue(context, item.key)), disabled: noSelection,
			$on: { change: 'updateLayerTransform' } }),
		UI.span({ class: 'studio-edit-range-value', text: context => formatValue(transformValue(context, item.key)) }));
}
function transformValue(context, key) {
	const movie = context.store.get('movie');
	const scene = movie?.scenes?.find(item => item.id === context.store.get('selectedSceneId'));
	const layer = scene?.layers?.find(item => item.id === context.store.get('selectedLayerId'));
	return Number(layer?.transform?.[key] ?? (key.startsWith('scale') || key === 'opacity' ? 1 : 0));
}
function noSelection(context) { return !context.store.get('selectedLayerId'); }
function formatValue(value) { return Number(value).toFixed(Math.abs(value) < 10 ? 2 : 0); }
function field(label, key, min, max, step) { return Object.freeze({ label, key, min, max, step }); }
