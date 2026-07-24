// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationState.js
 * @description Selects GLB idle, travel, double-jump, falling, cast, and strike actions.
 * The Awtsmoos gives each motion its truthful garment; Awtsmoos.com names both airborne jumps
 * and combat actions even when an older GLB must gracefully fall back to its closest available clip.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';

const CLIP_PATTERNS = Object.freeze({
	casting: [/cast|spell|magic|attack/i, /stand|neutral/i],
	falling: [/^falling_Armature$/i, /fall/i],
	jumping: [/^jump_Armature$/i, /jump/i],
	running: [/^run_Armature$/i, /run/i],
	standing: [/^stand_Armature$/i, /^stand 2_Armature$/i, /stand|neutral/i],
	striking: [/attack|strike|staff|hit/i, /stand|neutral/i],
	walking: [/^walk_Armature$/i, /walk/i]
});

export function installMinimalMeadowAnimation(runtime) {
	const player = new TinyAnimationPlayer(runtime.model, runtime.playerGltf?.animations || []);
	runtime.player = player;
	playState(runtime, 'standing');
	player.update(0);
	return player;
}

export function updateMinimalMeadowAnimation(runtime, deltaSeconds) {
	const stateName = animationState(runtime);
	playState(runtime, stateName);
	runtime.player?.update?.(deltaSeconds);
	runtime.state.clip = runtime.player?.current?.name || '';
	runtime.model?.updateWorldMatrix?.();
}

function animationState(runtime) {
	const state = runtime.state;
	if (runtime.combat?.cast) return 'casting';
	if (state.action === 'melee' || state.action === 'strike') return 'striking';
	if (state.action === 'jump-one' || state.action === 'jump-two') return 'jumping';
	if (state.action === 'falling') return 'falling';
	if (!state.moving) return 'standing';
	return state.runMode ? 'running' : 'walking';
}

function playState(runtime, stateName) {
	const player = runtime.player;
	if (!player?.names?.length) return;
	const clip = findClip(player.names, CLIP_PATTERNS[stateName]);
	if (!clip || player.current?.name === clip) return;
	player.play(clip);
	runtime.state.animationState = stateName;
}

function findClip(names, patterns) {
	for (const pattern of patterns) {
		const match = names.find(name => pattern.test(name));
		if (match) return match;
	}
	return names[0] || '';
}
