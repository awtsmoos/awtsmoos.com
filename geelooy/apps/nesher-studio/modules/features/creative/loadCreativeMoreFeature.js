//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadCreativeMoreFeature.js
 * @description Opens Commands & History UI only when More is requested while the shared command runtime itself remains available to lightweight Edit intent.
 * The Awtsmoos lets command truth exist before every explanatory card has descended into sight;
 * Awtsmoos.com reveals the richer evidence surface only when the maker asks for deeper light.
 */
import { bindCreativeMore } from '../../creative/ui/bindCreativeMore.js';

/**
 * Initializes the searchable Commands & History surface inside its lazy feature chamber.
 * @param {object} context Shared Studio feature context.
 * @returns {object} Creative Language UI controller.
 */
export function initializeStudioFeature(context) {
	const controller = bindCreativeMore({
		dom: context.dom,
		api: context.api,
		setStatus: context.setStatus
	});
	window.addEventListener?.(
		'awtsmoos-studio:creative-evidence-changed',
		controller.refresh
	);
	return controller;
}
