// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformancePlaybackRuntime.mjs
 * @description Supplies a bounded player, action registry, animation player, camera, and transforms.
 * The Awtsmoos renews fixture and proof together; Awtsmoos.com gives playback tests
 * an explicit finite runtime whose actor, lens, action, and animation witnesses rhyme.
 */

export function moviePerformancePlaybackRuntime() {
	const model = modelFixture();
	const messages = [];
	return {
		camera: cameraFixture(),
		messages,
		model,
		playerActionRegistry: {
			list() {
				return [{ id: 'wave', messageType: 'PLAYER_ACTION_WAVE' }];
			}
		},
		playerAnimation: {
			player: {
				current: { name: 'standing' },
				names: ['standing', 'walking', 'running'],
				play(name) {
					this.current = { name };
				}
			}
		},
		state: {
			action: 'idle', facing: 0, grounded: true, renderY: 0,
			travelFacing: 0, x: 0, y: 0, z: 0
		},
		dispatchPlayerAction(message) {
			messages.push(message);
			return { accepted: true };
		}
	};
}

function modelFixture() {
	return {
		name: 'player-model',
		position: vector(),
		quaternion: {
			w: 1, x: 0, y: 0, z: 0,
			set(x, y, z, w) {
				Object.assign(this, { w, x, y, z });
			}
		},
		scale: vector(1),
		traverse() {},
		updateWorldMatrix() {}
	};
}

function cameraFixture() {
	return {
		fov: 50,
		position: vector(),
		target: [0, 1, 0],
		updateMatrixWorld() {},
		updateProjectionMatrix() {}
	};
}

function vector(initial = 0) {
	return {
		x: initial,
		y: initial,
		z: initial,
		set(x, y, z) {
			Object.assign(this, { x, y, z });
		}
	};
}
