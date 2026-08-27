// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceCapabilities.js
 * @description Describes only animations, actions, skeletons, cameras, and movement truly present.
 * The Awtsmoos needs no false garment to reveal perfection; Awtsmoos.com lets
 * every supported and absent cinematic power be named honestly while capabilities rhyme.
 */

import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function moviePerformanceCapabilities(target = {}) {
	const names = animationNames(target);
	const actions = actionNames(target);
	const model = target.model || null;
	return Object.freeze({
		actionCapabilities: Object.freeze(actions),
		animationCapabilities: Object.freeze({
			available: Object.freeze(names),
			crouch: match(names, /crouch|kneel/i),
			facial: modelHasMorphTargets(model),
			idle: match(names, /stand|idle|neutral/i),
			jump: match(names, /jump|leap/i),
			run: match(names, /run|jog/i),
			turn: match(names, /turn/i),
			upperBodyBlend: Boolean(target.actions?.runtime),
			walk: match(names, /walk|step|stroll/i)
		}),
		availableCameras: Object.freeze([
			'director', 'follow', 'firstPerson', 'freeDirector', 'recorded'
		]),
		collision: Boolean(target.runtime?.collisionMover || target.kind === 'player'),
		gamepad: Boolean(globalThis.navigator?.getGamepads),
		jump: target.kind === 'player' && typeof target.runtime?.input?.consumeJump === 'function',
		skeletonCapabilities: Object.freeze(skeletonCapabilities(model)),
		touch: typeof globalThis.PointerEvent === 'function'
	});
}

export function moviePerformanceCapabilitySnapshot(target) {
	return moviePerformanceClone(moviePerformanceCapabilities(target));
}

function animationNames(target) {
	const values = target.player?.names
		|| target.runtime?.playerAnimation?.player?.names
		|| target.runtime?.player?.names
		|| [];
	return [...new Set(values.map(String))];
}

function actionNames(target) {
	const registry = target.actions?.registry || target.runtime?.playerActionRegistry;
	return (registry?.list?.() || []).map(item => ({ ...item }));
}

function skeletonCapabilities(model) {
	let bones = 0;
	let skinnedMeshes = 0;
	model?.traverse?.(object => {
		if (object.isBone) {
			bones += 1;
		}
		if (object.isSkinnedMesh) {
			skinnedMeshes += 1;
		}
	});
	return {
		bones,
		humanoidLikely: bones >= 10 && skinnedMeshes > 0,
		skinnedMeshes
	};
}

function modelHasMorphTargets(model) {
	let found = false;
	model?.traverse?.(object => {
		if (object.morphTargetInfluences?.length) {
			found = true;
		}
	});
	return found;
}

function match(names, expression) {
	return names.some(name => expression.test(name));
}
