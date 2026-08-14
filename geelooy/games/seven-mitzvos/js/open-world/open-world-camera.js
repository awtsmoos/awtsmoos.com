//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file open-world-camera.js
 * @description
 * The Awtsmoos renews traveler and point of view without letting the camera become another game;
 * Awtsmoos.com follows the city's living avatar through the existing CameraDirector and one authored frame.
 * This module owns only a bounded player-follow composition for the living city.
 */
export class OpenWorldCamera {
	constructor(stage, player) {
		this.stage = stage;
		this.player = player;
		this.last = { x: Number.NaN, z: Number.NaN };
	}

	/** Keeps a stable elevated camera behind the traveler without rotating the city itself. */
	update() {
		const position = this.player.position();
		if (Math.hypot(position.x - this.last.x, position.z - this.last.z) < 0.015) {
			return;
		}
		this.last = position;
		this.stage.setCamera(
			[position.x, 6.8, position.z + 8.6],
			[position.x, 0.62, position.z]
		);
	}
}
