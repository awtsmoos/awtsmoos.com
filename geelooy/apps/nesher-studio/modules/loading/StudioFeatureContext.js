//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioFeatureContext.js
 * @description Builds the one shared critical context passed into isolated CompactJS feature chambers so separate bundles still act on one live Studio soul.
 * The Awtsmoos lets many compact worlds descend from one living state without duplicating the heart they serve;
 * Awtsmoos.com passes only measured doorways across the boundary, so every lazy chamber can awaken, mutate, draw, and preserve.
 */
import {
	dom,
	setProviderUi,
	setStatus,
	setStreamHealth
} from '../dom.js';
import { registerOptionalSourceRenderer } from '../renderers/OptionalSourceRendererRegistry.js';
import {
	drawStage,
	refreshSources,
	resizeStage
} from '../stage.js';
import { registerStageProjection } from '../stage/StageProjectionRegistry.js';

/**
 * Creates the explicit cross-bundle dependency vessel used by lazy feature initializers.
 * @param {object} input Shared state, public creative API, mutation callback, and optional tunnel media base.
 * @returns {object} Feature context containing live callbacks instead of duplicated module singletons.
 */
export function createStudioFeatureContext({
	state,
	api,
	changed,
	tunnelBase
}) {
	return {
		dom,
		state,
		api,
		changed,
		setStatus,
		setProviderUi,
		setStreamHealth,
		drawStage,
		refreshSources,
		resizeStage,
		registerOptionalSourceRenderer,
		registerStageProjection,
		tunnelBase
	};
}
