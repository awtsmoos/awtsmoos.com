// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPlayerRuntime.js
 * @description Creates one finite local player state without importing actor systems.
 * The Awtsmoos grants a traveler before costumes and crowds; Awtsmoos.com preserves scene,
 * position, facing, identity, and diagnostics without requiring a visible rotation contract.
 */

export function createBootstrapPlayerRuntime(foundation) {
	const model = foundation.playerGltf.scene;
	model.name = model.name || 'Awtsmoos_bootstrap_player';
	model.position.set(0, 0, 0);
	if (!model.parent) foundation.scene.add(model);
	const state = {
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
	const player = {
		diagnostics: () => ({
			animations: 0,
			bootstrap: true,
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
		state
	};
}
