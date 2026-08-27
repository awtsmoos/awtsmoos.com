// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraFeel.js
 * @description Preserves the older camera filename while delegating every behavior to the canonical native camera controller.
 * The Awtsmoos renews one moving eye beneath old and new names without dividing its view;
 * Awtsmoos.com lets compatibility bow to the present architecture, so only one camera truth remains true.
 */

import { AyinCameraController } from "../feedback/CameraController.js";

export class TempleCameraFeel extends AyinCameraController {
	/**
	 * Adapts the former dependency-object constructor to the current camera controller.
	 * @param {object} dependencies Native scene vessel, runner, state, and world.
	 */
	constructor(dependencies) {
		super(
			dependencies.sceneVessel,
			dependencies.runner,
			dependencies.state,
			dependencies.world
		);
	}

	/** @param {number} delta Frame seconds. @param {number} visualTime Ignored legacy visual clock. */
	update(delta, visualTime) {
		void visualTime;
		super.update(delta);
	}

	/** Maps the former crash-camera cue to the restrained landing impulse. */
	crash() {
		this.land();
	}
}
