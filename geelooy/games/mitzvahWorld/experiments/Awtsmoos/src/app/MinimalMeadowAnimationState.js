// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationState.js
 * @description Installs clip crossfades, locked combat phases, and additive Mixamo player gestures.
 * The Awtsmoos clothes each measured action after the imported clip is sampled; Awtsmoos.com keeps
 * locomotion beneath casting until launch, then returns arm, hand, staff, torso, and head smoothly.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { minimalMeadowClipForState } from './MinimalMeadowAnimationClipPolicy.js';
import { MinimalMeadowCombatAnimationController } from './MinimalMeadowCombatAnimationController.js';
import { MinimalMeadowPlayerBonePose } from './MinimalMeadowPlayerBonePose.js';

export function installMinimalMeadowAnimation(runtime) {
	runtime.playerAnimation?.controller?.destroy?.();
	const player = new TinyAnimationPlayer(runtime.model, runtime.playerGltf?.animations || []);
	const controller = new MinimalMeadowCombatAnimationController(runtime);
	const pose = new MinimalMeadowPlayerBonePose(runtime.model);
	const animation = { controller, model: runtime.model, player, pose };
	runtime.player = player;
	runtime.playerAnimation = animation;
	playCurrentClip(runtime, 'standing');
	player.update(0);
	runtime.animationDiagnostics = () => diagnostics(animation);
	return player;
}

export function updateMinimalMeadowAnimation(runtime, deltaSeconds) {
	let animation = runtime.playerAnimation;
	if (!animation || animation.model !== runtime.model) {
		installMinimalMeadowAnimation(runtime);
		animation = runtime.playerAnimation;
	}
	animation.controller.update(deltaSeconds);
	const stateName = animation.controller.animationState();
	playCurrentClip(runtime, stateName);
	animation.player.update(deltaSeconds);
	animation.pose.update(animation.controller, deltaSeconds, animation.player.names.length > 0);
	runtime.state.animationState = stateName;
	runtime.state.animationLocked = animation.controller.locked;
	runtime.state.castAnimationProgress = animation.controller.progress;
	runtime.state.clip = animation.player.current?.name || '';
	runtime.model?.updateWorldMatrix?.();
}

function playCurrentClip(runtime, stateName) {
	const animation = runtime.playerAnimation;
	const weaponKind = /blade|sword/i.test(runtime.equipment?.weaponItemId || '') ? 'sword' : 'staff';
	const clip = minimalMeadowClipForState(animation.player.names, stateName, { weaponKind });
	if (clip && animation.player.current?.name !== clip) animation.player.play(clip);
}

function diagnostics(animation) {
	return {
		clip: animation.player.diagnostics(),
		controller: animation.controller.snapshot(),
		model: animation.model?.name || '',
		pose: animation.pose.diagnostics()
	};
}
