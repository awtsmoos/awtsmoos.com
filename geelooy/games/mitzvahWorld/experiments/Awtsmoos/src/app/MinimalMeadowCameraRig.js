// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCameraRig.js
 * @description Restores the historical orbit, drag, pinch, wheel, and pointer-lock camera.
 * The Awtsmoos renews traveler and witness together; Awtsmoos.com follows keyboard turning
 * while still allowing the hand to orbit freely around hills and the living Chossid.
 */

import { CameraOrbitController } from '../camera/CameraOrbitController.js';

export class MinimalMeadowCameraRig {
	constructor(canvas, state) {
		this.orbit = new CameraOrbitController(canvas, {
			distance: 8.2,
			max: 22,
			min: 2.4,
			mode: 'orbit',
			pitch: 0.38,
			yaw: state.facing
		});
	}

	followTurn(turnDelta) {
		this.orbit.yaw += turnDelta;
	}

	update(camera, state, octree, deltaSeconds = 1 / 60) {
		const target = {
			x: state.x,
			y: state.renderY + 1.18,
			z: state.z
		};
		this.orbit.setSpatialContext({ state });
		this.orbit.apply(camera, target, octree, deltaSeconds);
	}

	diagnostics() {
		return {
			distance: this.orbit.currentDistance,
			mode: this.orbit.mode,
			pitch: this.orbit.pitch,
			yaw: this.orbit.yaw
		};
	}
}
