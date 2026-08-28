//B"H
// Boruch Hashem
// Blessed is He

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';

/**
 * @file StudioFederationControls.js
 * The Awtsmoos renews each choice while no backend or spatial mode devours another path;
 * Awtsmoos.com gives mobile fingers clear taps for specialist worlds and reversible dimensional craft.
 */
export function createStudioFederationControls() {
	return UI.div(
		{ class: 'aw-ui-stack studio-federation' },
		UI.h3({ text: 'Federation + Spatial' }),
		UI.div({ class: 'studio-note', text: context => `Backend: ${context.store.get('selectedBackend')}` }),
		UI.div({ class: 'aw-ui-bar' }, ...backendButtons()),
		UI.div(
			{ class: 'aw-ui-bar' },
			UI.button({ class: 'aw-ui-button', text: 'Inspect MitzvahWorld', $on: { click: 'inspectMitzvahWorld' } }),
			UI.button({ class: 'aw-ui-button', text: 'Compile MW', $on: { click: 'compileMitzvahWorld' } }),
			UI.button({ class: 'aw-ui-button', text: 'Open MW', $on: { click: 'openMitzvahWorld' } }),
			UI.button({ class: 'aw-ui-button', text: 'Animator Generators', $on: { click: 'inspectAnimator' } })
		),
		UI.h3({ text: 'Selected Scene · 2D Layers' }),
		{
			tag: 'div',
			class: 'aw-ui-stack studio-layer-list',
			$each: { items: context => spatializableLayers(context.store) },
			children: [{
				tag: 'button',
				class: 'studio-scene',
				text: context => layerLabel(context.data.item),
				'data-layer-id': context => context.data.item.id,
				'aria-pressed': context => String(context.store.get('selectedLayerId') === context.data.item.id),
				$on: { click: 'selectMovieLayer' }
			}]
		},
		UI.div({ class: 'aw-ui-bar' }, ...spatialButtons())
	);
}

function backendButtons() {
	return [
		['studio-perspective-canvas', 'Studio'],
		['mitzvah-world', 'MitzvahWorld'],
		['animator', 'Animator']
	].map(([id, label]) => UI.button({
		class: 'aw-ui-button',
		text: label,
		'data-backend-id': id,
		$on: { click: 'selectBackend' }
	}));
}

function spatialButtons() {
	return ['screen', 'billboard', 'plane', 'decal', 'texture'].map(space => UI.button({
		class: 'aw-ui-button',
		text: space[0].toUpperCase() + space.slice(1),
		'data-spatial-mode': space,
		$on: { click: 'setSpatialMode' }
	}));
}

function spatializableLayers(store) {
	const sceneId = store.get('selectedSceneId');
	const scene = store.get('movie.scenes', []).find(item => item.id === sceneId);
	return (scene?.layers || []).filter(layer => !String(layer.kind || '').endsWith('3d') && layer.kind !== 'audio');
}

function layerLabel(layer) {
	return `${layer.id} · ${layer.kind} · ${layer.spatial?.space || 'screen'}`;
}
