// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Mounts one Chossid with playable lifecycle truth before rich hydration arrives.
 * The Awtsmoos grants one identity through fallback, defeat, and renewal; Awtsmoos.com keeps
 * health, collision, input, and two finite jumps inside one stable traveler from the first frame.
 */

import { createBootstrapVisiblePlayer } from './BootstrapVisiblePlayer.js';

export function createBootstrapPlayerRuntime(foundation) {
	const model = foundation.playerGltf.scene;
	model.name = model.name || 'Awtsmoos_minimal_meadow_player';
	model.position.set(0, 0, 0);
	model.setBaseTransform?.();
	let meshCount = markBootstrapMeshes(model);
	let visiblePlayer = model;
	if (meshCount === 0) {
		visiblePlayer = createBootstrapVisiblePlayer();
		model.add(visiblePlayer);
		meshCount = visiblePlayer.userData.meshCount;
	}
	if (!model.parent) foundation.scene.add(model);
	const state = createPlayerState();
	const player = {
		diagnostics: () => ({
			action: state.action,
			animations: foundation.playerGltf.animations?.length || 0,
			bootstrap: true,
			jumpsUsed: state.jumpsUsed,
			lifecycle: state.lifecycle,
			meshes: meshCount,
			position: { x: state.x, y: state.y, z: state.z }
		}),
		names: (foundation.playerGltf.animations || []).map(clip => clip.name || ''),
		update() {}
	};
	return {
		...foundation,
		feet: 0,
		footOffset: 0,
		model,
		player,
		playerStats: createPlayerStats(),
		state,
		visiblePlayer
	};
}

function markBootstrapMeshes(model) {
	let count = 0;
	model.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		object.userData ||= {};
		object.userData.bootstrapVisual = true;
		count += 1;
	});
	return count;
}

function createPlayerStats() {
	return {
		armor: 3,
		face: '🎩',
		health: 100,
		level: 1,
		maxHealth: 100,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}

function createPlayerState() {
	return {
		action: 'idle',
		airPhase: 'ground',
		clip: '',
		collisionEnabled: true,
		contacts: [],
		defeated: false,
		facing: 0,
		grounded: true,
		inputLocked: false,
		jumpsUsed: 0,
		level: 'meadow',
		lifecycle: 'active',
		moving: false,
		multiplayer: null,
		renderY: 0,
		runMode: false,
		targetingEnabled: true,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}
