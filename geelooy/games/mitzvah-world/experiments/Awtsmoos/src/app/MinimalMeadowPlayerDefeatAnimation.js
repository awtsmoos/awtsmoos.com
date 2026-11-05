// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatAnimation.js
 * @description Selects a truthful imported fall or preserves the separate procedural death lock.
 * The Awtsmoos gives every motion its garment without confusing locomotion with defeat;
 * Awtsmoos.com uses a suitable GLB clip when revealed and a named custom action otherwise.
 */

import { MINIMAL_MEADOW_PLAYER_DEFEAT_POLICY as POLICY } from './MinimalMeadowPlayerDefeatPolicy.js';

export function selectMinimalMeadowDefeatAnimation(runtime) {
	const names = runtime.player?.names || runtime.playerAnimation?.player?.names || [];
	for (const pattern of POLICY.animationPatterns) {
		const clip = names.find(name => pattern.test(name));
		if (clip) return { clip, kind: 'gltf' };
	}
	return { actionId: POLICY.proceduralAction, kind: 'custom' };
}

export function playMinimalMeadowDefeatAnimation(runtime, selection) {
	runtime.state.defeatAnimation = selection;
	if (selection.kind === 'gltf') runtime.player?.play?.(selection.clip);
	return selection;
}

export function clearMinimalMeadowDefeatAnimation(runtime) {
	const controller = runtime.playerAnimation?.controller;
	if (controller?.state === 'death') {
		Object.assign(controller, { duration: 0, elapsed: 0, payload: null, progress: 0, state: 'standing' });
		controller.sequence += 1;
		runtime.bus.emit('animation:state', controller.snapshot());
	}
	runtime.state.defeatAnimation = null;
}
