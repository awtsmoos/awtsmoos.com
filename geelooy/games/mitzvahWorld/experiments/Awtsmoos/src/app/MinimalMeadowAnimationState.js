// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAnimationState.js
 * @description Samples imported GLB motion before one bounded custom-action composition pass.
 * The Awtsmoos creates travel and special deed together; Awtsmoos.com preserves authoritative
 * stand, walk, run, jump, fall, punch, and stab beneath controlled upper-body revelation.
 */

import { TinyAnimationPlayer } from '../../../light-three-gltf/tiny-animation.js';
import { createPlayerActionSystem } from '../playerActions/PlayerActionSystem.js';
import {
	minimalMeadowImportedAnimationState,
	minimalMeadowRootUpDot,
	stabilizeMinimalMeadowLivingRoot,
	updateMinimalMeadowLegacyOverlay
} from './MinimalMeadowAnimationComposition.js';
import { minimalMeadowClipForState } from './MinimalMeadowAnimationClipPolicy.js';
import { MinimalMeadowCombatAnimationController } from './MinimalMeadowCombatAnimationController.js';
import { MinimalMeadowPlayerBonePose } from './MinimalMeadowPlayerBonePose.js';

export function installMinimalMeadowAnimation(runtime) {
	destroyInstalledAnimation(runtime);
	const player = new TinyAnimationPlayer(runtime.model, runtime.playerGltf?.animations || []);
	const controller = new MinimalMeadowCombatAnimationController(runtime);
	const pose = new MinimalMeadowPlayerBonePose(runtime.model);
	const actions = createPlayerActionSystem({
		actorId: 'player',
		bus: runtime.bus,
		equipment: runtime.equipment,
		model: runtime.model
	});
	const animation = {
		actions,
		controller,
		legacyPoseSuppressed: false,
		model: runtime.model,
		player,
		pose
	};
	runtime.player = player;
	runtime.playerAnimation = animation;
	exposePlayerActionApi(runtime, actions);
	playCurrentClip(runtime, 'standing');
	player.update(0);
	actions.runtime.captureImportedPose();
	runtime.animationDiagnostics = () => diagnostics(runtime, animation);
	return player;
}

export function updateMinimalMeadowAnimation(runtime, deltaSeconds) {
	let animation = runtime.playerAnimation;
	if (!animation || animation.model !== runtime.model) {
		installMinimalMeadowAnimation(runtime);
		animation = runtime.playerAnimation;
	}
	animation.controller.update(deltaSeconds);
	const semanticState = animation.controller.animationState();
	const importedState = minimalMeadowImportedAnimationState(
		runtime,
		animation,
		semanticState
	);
	playCurrentClip(runtime, importedState);
	animation.player.update(deltaSeconds);
	animation.actions.runtime.captureImportedPose();
	updateMinimalMeadowLegacyOverlay(animation, deltaSeconds);
	animation.actions.update(deltaSeconds);
	stabilizeMinimalMeadowLivingRoot(runtime, semanticState);
	recordAnimationState(runtime, animation, semanticState, importedState);
	runtime.model?.updateWorldMatrix?.();
}

function destroyInstalledAnimation(runtime) {
	runtime.playerAnimation?.controller?.destroy?.();
	runtime.playerAnimation?.actions?.destroy?.();
}

function exposePlayerActionApi(runtime, actions) {
	runtime.playerActionRegistry = actions.registry;
	runtime.playerActions = actions.runtime;
	runtime.registerPlayerAction = definition => actions.register(definition);
	runtime.dispatchPlayerAction = message => actions.dispatch(message);
}

function playCurrentClip(runtime, stateName) {
	const animation = runtime.playerAnimation;
	const itemId = runtime.equipment?.weaponItemId || '';
	const weaponKind = /blade|sword/i.test(itemId) ? 'sword' : 'staff';
	const clip = minimalMeadowClipForState(animation.player.names, stateName, { weaponKind });
	if (clip && animation.player.current?.name !== clip) {
		animation.player.play(clip);
	}
}

function recordAnimationState(runtime, animation, semanticState, importedState) {
	runtime.state.animationState = semanticState;
	runtime.state.animationBaseState = importedState;
	runtime.state.animationLocked = animation.controller.locked;
	runtime.state.castAnimationProgress = animation.controller.progress;
	runtime.state.customAction = animation.actions.snapshot();
	runtime.state.clip = animation.player.current?.name || '';
	runtime.state.rootUpDot = minimalMeadowRootUpDot(runtime);
}

function diagnostics(runtime, animation) {
	return {
		clip: animation.player.diagnostics(),
		controller: animation.controller.snapshot(),
		customAction: animation.actions.snapshot(),
		model: animation.model?.name || '',
		pose: animation.pose.diagnostics(),
		registeredActions: animation.actions.registry.list(),
		rootUpDot: minimalMeadowRootUpDot(runtime)
	};
}
