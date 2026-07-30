// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRoster.js
 * @description Discovers real human runtime performers and classifies authored scene objects honestly.
 * The Awtsmoos creates player, Chossid, prop, camera, light, and world without confusion;
 * Awtsmoos.com gives each stable identity and capability evidence in a director-readable rhyme.
 */

import { MoviePerformanceRuntimeTarget } from './MoviePerformanceRuntimeTarget.js';
import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function discoverMoviePerformanceTargets(runtime, project) {
	const targets = [];
	if (runtime?.model) {
		targets.push(new MoviePerformanceRuntimeTarget({
			id: 'player',
			kind: 'player',
			model: runtime.model,
			modelId: runtime.model.name || 'player-model',
			name: 'Player Chossid',
			runtime,
			runtimeTarget: 'runtime.model'
		}));
	}
	for (const actor of runtime?.friendlyNpcs?.actors || []) {
		targets.push(new MoviePerformanceRuntimeTarget({
			actions: actor.actions,
			actor,
			id: actor.id,
			kind: 'human',
			model: actor.model,
			modelId: actor.model?.name || actor.id,
			name: friendlyName(actor.id),
			player: actor.player,
			runtime,
			runtimeTarget: `runtime.friendlyNpcs.${actor.id}`
		}));
	}
	return mergeAuthoredPerformers(targets, project);
}

export function catalogMoviePerformanceCharacters(targets) {
	return moviePerformanceClone(targets.map(target => ({
		actionCapabilities: target.actionCapabilities(),
		animationCapabilities: target.animationCapabilities(),
		availableCameras: target.capabilities().availableCameras,
		controllable: Boolean(target.model),
		currentAnimation: target.currentAnimation(),
		currentTransform: target.transformSnapshot(),
		id: target.id,
		kind: target.kind,
		modelId: target.modelId,
		name: target.name,
		runtimeTarget: target.runtimeTarget,
		skeletonCapabilities: target.capabilities().skeletonCapabilities
	})));
}

export function classifyMoviePerformanceObject(object) {
	if (object?.isCamera) {
		return 'camera';
	}
	if (object?.isLight) {
		return 'light';
	}
	if (/chossid|human|person|player|actor/i.test(object?.name || '')) {
		return 'human';
	}
	if (object?.isMesh || object?.isSkinnedMesh) {
		return object.isSkinnedMesh ? 'nonhuman-performer' : 'prop';
	}
	return 'world';
}

function mergeAuthoredPerformers(targets, project) {
	const known = new Set(targets.map(target => target.id));
	for (const performer of project?.performance?.performers || []) {
		if (!known.has(performer.id)) {
			targets.push(new MoviePerformanceRuntimeTarget({
			id: performer.id,
			kind: 'human',
			model: null,
			modelId: performer.id,
			name: performer.name,
			runtimeTarget: null
		}));
		}
	}
	return targets;
}

function friendlyName(id) {
	return id.split('-').map(part => (
		part.charAt(0).toUpperCase() + part.slice(1)
	)).join(' ');
}
