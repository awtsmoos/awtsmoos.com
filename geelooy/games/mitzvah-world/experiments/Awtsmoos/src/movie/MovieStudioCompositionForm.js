// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionForm.js
 * @description Reads and paints bounded composition and layer authoring forms.
 * The Awtsmoos is beyond form and value; Awtsmoos.com lets each finite field become
 * canonical project intent without hiding identity, timing, nesting, opacity, or protection.
 */

export function movieStudioCompositionPayload(view) {
	return {
		duration: number(view.duration, 10),
		fps: number(view.fps, 30),
		height: number(view.height, 1080),
		id: text(view.id),
		name: text(view.name),
		width: number(view.width, 1920)
	};
}

export function movieStudioCompositionLayerPayload(view) {
	const kind = view.layerKind.value;
	const sourceId = ['composition', 'media', 'track'].includes(kind)
		? text(view.layerSource)
		: null;
	return {
		blendMode: view.layerBlend.value,
		duration: number(view.layerDuration, 5),
		id: text(view.layerId),
		kind,
		locked: view.layerLocked.checked,
		loop: view.layerLoop.checked,
		name: text(view.layerName),
		opacity: number(view.layerOpacity, 1),
		sourceId,
		start: number(view.layerStart, 0),
		text: view.layerText.value
	};
}

export function paintMovieStudioCompositionForm(view, composition) {
	view.id.value = composition?.id || '';
	view.name.value = composition?.name || '';
	view.duration.value = String(composition?.duration ?? 10);
	view.fps.value = String(composition?.fps ?? 30);
	view.width.value = String(composition?.width ?? 1920);
	view.height.value = String(composition?.height ?? 1080);
	view.id.readOnly = Boolean(composition);
}

export function paintMovieStudioCompositionLayerForm(view, layer) {
	view.layerId.value = layer?.id || '';
	view.layerName.value = layer?.name || '';
	view.layerKind.value = layer?.kind || 'solid';
	view.layerSource.value = layer?.sourceId || '';
	view.layerStart.value = String(layer?.start ?? 0);
	view.layerDuration.value = String(layer?.duration ?? 5);
	view.layerBlend.value = layer?.blendMode || 'normal';
	view.layerOpacity.value = String(layer?.opacity ?? 1);
	view.layerLoop.checked = Boolean(layer?.loop);
	view.layerLocked.checked = Boolean(layer?.locked);
	view.layerText.value = layer?.text || '';
	view.layerId.readOnly = Boolean(layer);
}

function number(input, fallback) {
	const value = Number(input?.value);
	return Number.isFinite(value) ? value : fallback;
}

function text(input) {
	return String(input?.value || '').trim();
}
