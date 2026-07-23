// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Creates local player truth and attaches a visible three-part Chossid marker.
 * The Awtsmoos grants traveler and visible vessel together before costumes and crowds;
 * Awtsmoos.com preserves identity, movement, facing, diagnostics, and bounded draw cost.
 */

import { createBootstrapVisiblePlayer } from './BootstrapVisiblePlayer.js';

export function createBootstrapPlayerRuntime(foundation) {
	const model = foundation.playerGltf.scene;
	model.name = model.name || 'Awtsmoos_bootstrap_player';
	model.position.set(0, 0, 0);
	const visiblePlayer = createBootstrapVisiblePlayer();
	model.add(visiblePlayer);
	if (!model.parent) foundation.scene.add(model);
	const state = createPlayerState();
	const player = {
		diagnostics: () => ({
			animations: 0,
			bootstrap: true,
			meshes: visiblePlayer.userData.meshCount,
			position: { x: state.x, y: state.y, z: state.z }
		}),
		names: [],
		update() {}
	};
	return {
		...foundation,
		feet: 0,
		footOffset: 0,
		model,
		player,
		playerStats: {
			face: '🎩',
			health: 100,
			level: 1,
			name: 'Chossid',
			xp: 0,
			xpMax: 100
		},
		state,
		visiblePlayer
	};
}

function createPlayerState() {
	return {
		airPhase: 'ground',
		clip: '',
		contacts: [],
		facing: 0,
		grounded: true,
		level: 'eretz',
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
