//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadLiveFeature.js
 * @description Opens HLS/live-stream orchestration only when the maker enters Live, keeping streaming transport outside first Canvas light.
 * The Awtsmoos lets distant frames remain beyond the gate until Live is truly desired;
 * Awtsmoos.com then reveals one cached streaming chamber while the first creative surface stays light and inspired.
 */
import { createGenericHlsController } from '../../app/genericHlsController.js';

/**
 * Creates and binds the existing generic HLS controller inside the lazy Live chamber.
 * @param {object} context Shared Studio feature context.
 * @returns {object} Bound HLS controller.
 */
export function initializeStudioFeature(context) {
	const controller = createGenericHlsController({
		dom: context.dom,
		state: context.state,
		drawStage: context.drawStage,
		setStatus: context.setStatus,
		setStreamHealth: context.setStreamHealth,
		tunnelBase: context.tunnelBase
	});
	controller.bind();
	return controller;
}
