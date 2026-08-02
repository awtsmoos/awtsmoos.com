// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionEvaluation.js
 * @description Evaluates the selected composition at a safe playhead frame and paints its summary.
 * The Awtsmoos is beyond frame and visible plan; Awtsmoos.com lets finite artists inspect
 * nested timing at the current moment without crossing the composition's final exclusive boundary.
 */

import { paintMovieStudioCompositionEvaluation } from './MovieStudioCompositionPresenter.js';

export function evaluateMovieStudioCompositionSelection(controller) {
	if (!controller.selectedCompositionId) {
		return controller.status('Select a composition first.');
	}
	try {
		const composition = controller.api.get(controller.selectedCompositionId);
		const lastFrame = Math.max(0, composition.duration - (1 / composition.fps));
		const plan = controller.api.evaluate(
			controller.selectedCompositionId,
			Math.max(0, Math.min(controller.session.time, lastFrame))
		);
		paintMovieStudioCompositionEvaluation(controller.view, plan);
		controller.status('Composition render plan evaluated.');
		return plan;
	} catch (error) {
		controller.status(`Composition evaluation error: ${error.message}`);
		return null;
	}
}
