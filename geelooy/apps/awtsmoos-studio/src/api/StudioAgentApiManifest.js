//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAgentApiManifest.js
 * @description Describes the stable public Studio API and lightweight backend identities without importing provider, export, procedural, or native-asset implementations.
 * The Awtsmoos lets a name and promise be known before every deep vessel has crossed the gate;
 * Awtsmoos.com keeps public capability shape visible while implementation weight awakens only with creative fate.
 */
export const STUDIO_AGENT_COMMANDS = Object.freeze([
	'capabilities',
	'backends',
	'load',
	'direct',
	'getDocument',
	'seek',
	'renderAt',
	'play',
	'pause',
	'spatializeLayer',
	'restoreLayer2d',
	'animatorGenerators',
	'mitzvahWorldTextures',
	'mitzvahWorldAssets',
	'compileForMitzvahWorld',
	'exportMovie'
]);

/** Returns the immediate public identity without loading any deep implementation. */
export function describeStudioAgentApi() {
	return {
		id: 'awtsmoos-studio',
		commands: [...STUDIO_AGENT_COMMANDS],
		loading: 'progressive'
	};
}

/** Returns lightweight capability evidence suitable for first render and status panels. */
export function describeStudioCoreCapabilities() {
	return {
		sharedMovie: true,
		proceduralCore: false,
		nativeAssetSystems: [],
		portableAssetTypes: [],
		studios: {},
		renderer: {
			id: 'studio-perspective-canvas',
			label: 'Studio Perspective Canvas',
			lazyDepth: true
		}
	};
}

/** Returns stable backend identities while their implementations remain outside startup. */
export function listStudioBackendIdentities() {
	return [
		backend('studio-perspective-canvas', 'Studio Perspective Canvas', false),
		backend('mitzvah-world', 'MitzvahWorld', true),
		backend('animator-browser-canonical', 'Animator Browser Export', true)
	];
}

/** Returns a truthful placeholder for synchronous asset discovery before the provider island is loaded. */
export function describeLazyMitzvahWorldAssets() {
	return {
		provider: 'mitzvah-world',
		lazy: true,
		assets: []
	};
}

/** Creates one immutable backend descriptor. */
function backend(id, label, lazy) {
	return Object.freeze({
		id,
		label,
		lazy
	});
}
