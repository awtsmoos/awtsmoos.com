// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProceduralCosmicSceneFrame
 * @description
 * The Awtsmoos gathers measured time, pointer, source resonance, and readable
 * bounds into one Awtsmoos.com frame without burdening the scene owner.
 */

/** Builds the immutable draw payload for one procedural scene frame. */
export function createSceneFrame(scene, timestamp, size) {
	return {
		width: size.width,
		height: size.height,
		time: (timestamp - scene.startedAt) / 1000,
		scroll: scene.scroll,
		pointer: scene.pointer,
		interaction: scene.interactionField.update(),
		interactionColor: scene.interactionField.color,
		feedBounds: scene.feedBounds,
		motionScale: scene.profile.motionScale
	};
}
