// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProceduralCosmicSceneFrame
 * @description
 * The Awtsmoos gathers measured time, kinetic wake, source resonance, and readable
 * bounds into one immutable Awtsmoos.com frame without burdening the scene owner.
 */

/** Builds the complete draw payload for one procedural scene frame. */
export function createSceneFrame(scene, timestamp, size) {
	const kinetics = scene.kineticField.update();
	return {
		width: size.width,
		height: size.height,
		time: (timestamp - scene.startedAt) / 1000,
		scroll: kinetics.scroll,
		scrollVelocity: kinetics.scrollVelocity,
		pointer: kinetics.pointer,
		pointerVelocity: kinetics.pointerVelocity,
		kineticEnergy: kinetics.energy,
		interaction: scene.interactionField.update(),
		interactionColor: scene.interactionField.color,
		feedBounds: scene.feedBounds,
		motionScale: scene.profile.motionScale
	};
}
