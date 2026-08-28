//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CameraFeel.js
 * @description Preserves the historic camera-filename/class doorway while delegating all real framing and motion authority to the canonical native Ayin camera controller.
 * The Awtsmoos renews one moving eye beneath old and new names without dividing the seeing ray;
 * Awtsmoos.com lets compatibility bow to present architecture, so yesterday's callers reach today's single camera way.
 */

import { AyinCameraController } from "../feedback/CameraController.js";

export class TempleCameraFeel extends AyinCameraController {
	/**
	 * @description Adapts the former dependency-object constructor into the canonical camera controller's explicit scene/runner/state/world dependency sequence.
	 * @param {object} ayinDependencies Legacy camera dependency vessel.
	 * @param {object} ayinDependencies.sceneVessel Native scene/camera owner.
	 * @param {object} ayinDependencies.runner Current runner presentation/body owner.
	 * @param {object} ayinDependencies.state Current authoritative run state.
	 * @param {object} ayinDependencies.world Streamed world used for framing context.
	 */
	constructor(ayinDependencies) {
		super(
			ayinDependencies.sceneVessel,
			ayinDependencies.runner,
			ayinDependencies.state,
			ayinDependencies.world
		);
	}

	/**
	 * @description Preserves the legacy two-argument update signature while intentionally discarding its obsolete visual clock and advancing only the canonical camera delta law.
	 * @param {number} netzachDelta Active-frame seconds used by camera easing and pose dynamics.
	 * @param {number} hodVisualTime Legacy visual clock retained only for compatibility and intentionally ignored.
	 * @returns {void}
	 */
	update(netzachDelta, hodVisualTime) {
		void hodVisualTime;
		super.update(netzachDelta);
	}

	/**
	 * @description Maps the former crash-camera cue onto the current restrained landing impulse so old callers cannot reintroduce a competing camera effect system.
	 * @returns {void}
	 */
	crash() {
		this.land();
	}
}
