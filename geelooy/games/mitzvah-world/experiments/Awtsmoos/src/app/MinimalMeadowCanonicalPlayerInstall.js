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
import { shrinkCanonicalHeadAnimation } from './CanonicalChossidProportions.js';
import {
	registerBootstrapMeadowTreeCollision,
	scheduleBootstrapTreeCollisionRetry
} from './BootstrapMeadowTreeCollision.js';

/** Installs one canonical grounded player and binds animation to its movable outer root. */
export function installCanonicalPlayer(runtime, predecessor, gltf, prepared, dependencies = {}) {
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
	// B"H: the head shrink must happen HERE, on the gltf the player actually
	// animates. The first-play runtime shrinks the essential gate's clips,
	// but the live player is hydrated from a FRESH loadIsolatedGltf instance
	// whose channels are new objects — the earlier shrink edits the wrong
	// clip set and the Head scale tracks restore 1.0 on the first frame.
	// Shrinking at this doorway covers every install path.
	shrinkCanonicalHeadAnimation(gltf.animations);
	const animation = installCanonicalChossidAnimation(runtime, gltf);
	// B"H: the first-control tree registration can run before the terrain
	// group lands in the live scene, leaving an empty octree with no error
	// and no retry. Retry here, once the player — and the world around it —
	// is installed; the registration is idempotent per tree, so a first
	// control that already worked adds nothing. And schedule retries after
	// it: the trees can still arrive after the install (the terrain group
	// lands with hydration), and the assembly that used to schedule them
	// does not build this runtime — this doorway is the one that does.
	try {
		registerBootstrapMeadowTreeCollision(runtime);
	} catch {}
	const scheduleTreeCollisionRetry = dependencies.scheduleTreeCollisionRetry
		|| scheduleBootstrapTreeCollisionRetry;
	try {
		scheduleTreeCollisionRetry(runtime);
	} catch {}
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
