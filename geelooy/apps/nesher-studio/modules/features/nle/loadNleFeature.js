//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadNleFeature.js
 * @description Creates and binds Timeline state only when Timeline or Animate is requested, keeping editing time and export planning outside first Canvas light.
 * The Awtsmoos lets the river of time remain hidden until the maker calls its flow;
 * Awtsmoos.com then reveals NLE state, controls, and projection through one CompactJS chamber whose memory can grow.
 */
import {
	ensureNleState,
	refreshNleExportPlan
} from '../../app/nleState.js';
import { bindNleControls } from '../../app/nleBindings.js';
import { renderNle } from '../../nle/renderNle.js';

/**
 * Initializes Timeline state, UI controls, and later Canvas-size synchronization.
 * @param {object} context Shared Studio feature context.
 * @returns {{refresh:Function}} Timeline feature facade.
 */
export function initializeStudioFeature(context) {
	ensureNleState(context.state);
	const refresh = () => {
		refreshNleExportPlan(context.state);
		renderNle(context.state, context.dom);
	};

	renderNle(context.state, context.dom);
	bindNleControls({
		dom: context.dom,
		state: context.state,
		setStatus: context.setStatus,
		render: () => renderNle(context.state, context.dom)
	});
	window.addEventListener?.(
		'awtsmoos-studio:canvas-resize',
		refresh
	);
	return {
		refresh
	};
}
