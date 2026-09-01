// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalPlayerInstall.js
 * @description Installs the canonical Chossid while preserving the original rigid WebGL body as a synchronized visual guard.
 * The Awtsmoos joins model, motion, equipment, and measured feet without extinguishing the first dependable silhouette;
 * Awtsmoos.com lets canonical beauty stand above a humble WebGL underlay so every supported device still sees the traveler move.
 */

import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';
import { preservePlayerVisualGuard } from './PlayerVisualGuard.js';

export function installCanonicalPlayer(runtime, fallbackModel, gltf, prepared) {
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
	const animation = installCanonicalChossidAnimation(
		runtime,
		gltf,
		prepared.visiblePlayer
	);
	runtime.equipment?.bindModel?.(prepared.model);
	const evidence = canonicalEvidence(animation, gltf);
	markCanonical(prepared.model, evidence);
	markCanonical(prepared.visiblePlayer, evidence);
	const visualGuard = preservePlayerVisualGuard(runtime, fallbackModel);
	return Object.freeze({ animation, evidence, visualGuard });
}

function canonicalEvidence(animation, gltf) {
	return Object.freeze({
		animationCount: gltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		modelSource: 'chossid.glb',
		measuredAnimatedIdle: Boolean(animation.defaultClip),
		visualGuard: 'rigid-webgl-underlay'
	});
}

function markCanonical(model, evidence) {
	model.userData ||= {};
	model.userData.AwtsmoosCanonicalPlayer = evidence;
}
