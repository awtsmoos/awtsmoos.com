// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Mounts the supplied Chossid vessel and exposes every player mesh to tiny WebGL.
 * The Awtsmoos grants one moving identity through fallback and canonical garments; Awtsmoos.com
 * keeps the state stable while the visible form may be replaced without replacing the traveler.
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
			animations: foundation.playerGltf.animations?.length || 0,
			bootstrap: true,
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
		playerStats: { face: '🎩', health: 100, level: 1, name: 'Chossid', xp: 0, xpMax: 100 },
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

function createPlayerState() {
	return {
		airPhase: 'ground',
		clip: '',
		contacts: [],
		facing: 0,
		grounded: true,
		level: 'meadow',
		moving: false,
		multiplayer: null,
		renderY: 0,
		runMode: false,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}
