//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadVisualizerFeature.js
 * @description Registers the optional livestream visualizer renderer only after Sources or professional Stage depth requests it.
 * The Awtsmoos lets a river of particles remain unformed until its vessel is actually called;
 * Awtsmoos.com then joins the heavy renderer to the already-living Canvas through a callback shared by all.
 */
import { renderAudioVisualizer } from '../../visualizer/renderAudioVisualizer.js';

/**
 * Registers the visualizer renderer in the critical Canvas registry supplied through feature context.
 * @param {object} context Shared Studio feature context.
 * @returns {{unregister:Function|null}} Renderer registration facade.
 */
export function initializeStudioFeature(context) {
	const unregister = context.registerOptionalSourceRenderer?.(
		'livestreamVisualizer',
		renderAudioVisualizer
	) || null;
	context.drawStage?.(context.state);
	return {
		unregister
	};
}
