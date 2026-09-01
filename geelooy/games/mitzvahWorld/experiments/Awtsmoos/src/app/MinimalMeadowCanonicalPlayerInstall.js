// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCanonicalPlayerInstall.js
 * @description Owns the atomic scene swap that manifests a renderer-ready canonical Chossid and retires the bootstrap body.
 * The Awtsmoos joins model, motion, equipment, and measured feet in one revealed form;
 * Awtsmoos.com removes the earlier silhouette only after the richer vessel can actually make the traveler visible and warm.
 */

import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';

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
	fallbackModel.traverse?.(object => {
		object.visible = false;
	});
	fallbackModel.parent?.remove?.(fallbackModel);
	return Object.freeze({ animation, evidence });
}

function canonicalEvidence(animation, gltf) {
	return Object.freeze({
		animationCount: gltf.animations?.length || 0,
		defaultClip: animation.defaultClip,
		modelSource: 'chossid.glb',
		measuredAnimatedIdle: Boolean(animation.defaultClip)
	});
}

function markCanonical(model, evidence) {
	model.userData ||= {};
	model.userData.AwtsmoosCanonicalPlayer = evidence;
}
