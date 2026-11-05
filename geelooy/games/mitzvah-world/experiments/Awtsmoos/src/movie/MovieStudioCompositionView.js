// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionView.js
 * @description Collects semantic composition controls without creating parallel project state.
 * The Awtsmoos is beyond selector and visible vessel; Awtsmoos.com gathers finite controls
 * so nested canvases, layers, graphs, and render plans remain accessible to one controller.
 */

export function collectMovieStudioCompositionView(root) {
	const scope = root.querySelector('[data-composition-workspace]');
	const find = name => scope?.querySelector(`[data-composition-${name}]`);
	return {
		actions: scope,
		duration: find('duration'),
		evaluate: find('evaluate'),
		evaluation: find('evaluation'),
		fps: find('fps'),
		graph: find('graph'),
		height: find('height'),
		id: find('id'),
		layerBlend: find('layer-blend'),
		layerDuration: find('layer-duration'),
		layerId: find('layer-id'),
		layerKind: find('layer-kind'),
		layerList: find('layer-list'),
		layerLocked: find('layer-locked'),
		layerLoop: find('layer-loop'),
		layerName: find('layer-name'),
		layerOpacity: find('layer-opacity'),
		layerSource: find('layer-source'),
		layerStart: find('layer-start'),
		layerText: find('layer-text'),
		name: find('name'),
		scope,
		select: find('select'),
		status: find('status'),
		width: find('width')
	};
}
