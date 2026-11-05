// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalPlayerInstall.js
 * @description Atomically installs the authored Chossid and removes every predecessor while keeping the grounded outer model authoritative.
 * The Awtsmoos lets richer manifestation replace lesser vessels without double form; Awtsmoos.com keeps one traveler in sight,
 * so bones animate inside the same grounded root whose world translation is exposed to movement, diagnostics, and proof.
 */

import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';

/** Installs one canonical grounded player and binds animation to its movable outer root. */
export function installCanonicalPlayer(runtime, predecessor, gltf, prepared) {
	runtime.scene.add(prepared.model);
	runtime.model = prepared.model;
	runtime.visiblePlayer = prepared.visiblePlayer;
	runtime.canonicalPlayerScene = prepared.visiblePlayer;
	runtime.playerGltf = { ...gltf, scene: prepared.visiblePlayer };
	runtime.feet = prepared.feet;
	runtime.footOffset = 0;
	runtime.state.feet = prepared.feet;
	for (const vessel of [runtime.collisionMover, runtime.mover, runtime.jumpPhysics]) {
		if (vessel) vessel.footOffset = 0;
	}
	const animation = installCanonicalChossidAnimation(runtime, gltf);
	runtime.equipment?.bindModel?.(prepared.model);
	const evidence = canonicalEvidence(animation, gltf);
	markCanonical(prepared.model, evidence);
	markCanonical(prepared.visiblePlayer, evidence);
	removePredecessor(predecessor, prepared.model);
	runtime.playerVisualGuard = null;
	return Object.freeze({ animation, evidence, visualGuard: null });
}

/** Returns immutable authored-model evidence for diagnostics and downstream readiness. */
function canonicalEvidence(animation, gltf) {
	return Object.freeze({
		animationCount: gltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		modelSource: 'chossid.glb',
		measuredAnimatedIdle: Boolean(animation.defaultClip),
		visualGuard: 'none-glb-only'
	});
}

/** Marks one canonical scene vessel with shared immutable evidence. */
function markCanonical(model, evidence) {
	model.userData ||= {};
	model.userData.AwtsmoosCanonicalPlayer = evidence;
}

/** Removes a predecessor only after the grounded canonical root is installed. */
function removePredecessor(predecessor, canonicalRoot) {
	if (!predecessor || predecessor === canonicalRoot) return;
	predecessor.traverse?.(object => {
		object.visible = false;
	});
	predecessor.parent?.remove?.(predecessor);
}
