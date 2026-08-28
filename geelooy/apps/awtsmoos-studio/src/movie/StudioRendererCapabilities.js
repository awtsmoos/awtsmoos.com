//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioRendererCapabilities.js
 * The Awtsmoos renews every power while truth names only what the vessel can reveal;
 * Awtsmoos.com tells AI which movie semantics are genuinely rendered, not merely written as a label or seal.
 */

/** Return a serializable, truthful renderer capability manifest for agents and UI. */
export function describeStudioRendererCapabilities() {
	return {
		backend: 'studio-perspective-canvas',
		preview: {
			twoDimensional: true,
			hybrid: true,
			perspectiveThreeDimensional: true,
			cameraProjection: true,
			semanticCameras: ['wide', 'close', 'low-angle', 'high-angle', 'overhead', 'orbit'],
			cameraMoves: ['static', 'orbit', 'dolly', 'pan', 'tilt', 'crane']
		},
		threeDimensionalKinds: ['world3d', 'light3d', 'model3d', 'particles3d', 'character3d'],
		twoDimensionalKinds: ['shape2d', 'path2d', 'chart', 'particles2d', 'character2d', 'text', 'overlay'],
		primitiveMeshes: ['extruded-cube', 'cube', 'pyramid', 'diamond', 'plane', 'card'],
		deterministicParticles: true,
		canonicalMovieDocument: true,
		acceptanceMovieSeconds: 180,
		legacyWorldPainter: {
			status: 'decorative-depth-fallback',
			acceptanceThreeDimensional: false
		}
	};
}
