// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionPresenter.js
 * @description Paints composition choices, layer cards, graph status, and evaluation summaries safely.
 * The Awtsmoos is beyond list and rendered witness; Awtsmoos.com reveals finite nesting
 * through DOM text and attributes only, never executable project markup or hidden parallel state.
 */

import {
	paintMovieStudioCompositionForm,
	paintMovieStudioCompositionLayerForm
} from './MovieStudioCompositionForm.js';

export function paintMovieStudioCompositionWorkspace(
	view,
	compositions,
	selectedCompositionId,
	selectedLayerId
) {
	const composition = compositions.find(item => item.id === selectedCompositionId) || null;
	paintOptions(view.select, compositions, selectedCompositionId, 'No compositions');
	paintOptions(
		view.layerSource,
		compositions.filter(item => item.id !== selectedCompositionId),
		composition?.layers.find(item => item.id === selectedLayerId)?.sourceId,
		'Choose source'
	);
	paintMovieStudioCompositionForm(view, composition);
	const layer = composition?.layers.find(item => item.id === selectedLayerId) || null;
	paintMovieStudioCompositionLayerForm(view, layer);
	paintLayerList(view.layerList, composition, selectedLayerId);
	paintGraph(view.graph, compositions, composition);
	return { composition, layer };
}

export function paintMovieStudioCompositionEvaluation(view, plan) {
	if (!plan) {
		view.evaluation.textContent = 'No render plan evaluated.';
		return;
	}
	view.evaluation.textContent = [
		`${plan.compositionId} at ${plan.time.toFixed(3)}s`,
		`${plan.layers.length} visible leaf layer${plan.layers.length === 1 ? '' : 's'}`,
		`${plan.width}×${plan.height} · ${plan.fps} fps`
	].join(' · ');
}

function paintOptions(select, items, selectedId, emptyLabel) {
	const options = [];
	const empty = document.createElement('option');
	empty.value = '';
	empty.textContent = emptyLabel;
	options.push(empty);
	for (const item of items) {
		const option = document.createElement('option');
		option.value = item.id;
		option.textContent = `${item.name} · ${item.id}`;
		options.push(option);
	}
	select.replaceChildren(...options);
	select.value = selectedId || '';
}

function paintLayerList(list, composition, selectedLayerId) {
	list.replaceChildren();
	if (!composition?.layers.length) {
		const empty = document.createElement('p');
		empty.className = 'movie-composition-empty';
		empty.textContent = composition ? 'No layers yet.' : 'Create or select a composition.';
		list.append(empty);
		return;
	}
	composition.layers.forEach((layer, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.compositionLayerSelect = layer.id;
		button.setAttribute('role', 'option');
		button.setAttribute('aria-selected', String(layer.id === selectedLayerId));
		button.className = 'movie-composition-layer-card';
		button.textContent = [
			`${index + 1}. ${layer.name}`,
			layer.kind,
			`${layer.start.toFixed(3)}–${(layer.start + layer.duration).toFixed(3)}s`,
			layer.locked ? 'locked' : 'editable'
		].join(' · ');
		list.append(button);
	});
}

function paintGraph(output, compositions, selected) {
	const nested = selected?.layers.filter(layer => layer.kind === 'composition') || [];
	output.textContent = selected
		? `${compositions.length} composition${compositions.length === 1 ? '' : 's'} · ${selected.layers.length} layers · ${nested.length} nested references`
		: `${compositions.length} composition${compositions.length === 1 ? '' : 's'} in project`;
}
