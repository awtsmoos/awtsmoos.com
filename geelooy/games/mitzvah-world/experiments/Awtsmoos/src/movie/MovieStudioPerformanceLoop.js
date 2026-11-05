// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceLoop.js
 * @description Advances voice, selected live movement, armed recording, camera, status, and acting aids.
 * The Awtsmoos renews actor, lens, voice, guide, input, and sample inside one animation breath;
 * Awtsmoos.com lets selection receive live control while arming retains recording precedence in truth.
 */

export class MovieStudioPerformanceLoop {
	constructor(controller, environment = globalThis) {
		this.controller = controller;
		this.environment = environment;
		this.frame = 0;
		this.previous = 0;
		this.tick = time => this.update(time);
		this.frame = this.environment.requestAnimationFrame?.(
			this.tick
		) || 0;
	}

	update(time) {
		const controller = this.controller;
		const delta = this.previous
			? Math.max(0, Math.min(0.1, (time - this.previous) / 1000))
			: 1 / 60;
		this.previous = time;
		controller.audioDirector.apply(controller.session.time);
		if (controller.active()) {
			this.updateLivePerformance(controller, delta);
		}
		const snapshot = controller.status();
		controller.view.render(snapshot);
		controller.overlay.render(snapshot);
		this.frame = this.environment.requestAnimationFrame?.(
			this.tick
		) || 0;
	}

	updateLivePerformance(controller, delta) {
		controller.gamepad.update();
		const target = controller.armedTarget()
			|| controller.selectedTarget();
		if (!target) {
			return;
		}
		const settings = controller.settings();
		controller.lastMovement = controller.movement.update(
			target,
			delta,
			settings
		);
		controller.cameraRig.update(
			settings.cameraMode,
			target,
			settings.camera,
			delta
		);
		controller.state.lastInput = controller.input.snapshot();
		controller.updateRecording(delta);
	}

	destroy() {
		if (this.frame) {
			this.environment.cancelAnimationFrame?.(this.frame);
		}
		this.frame = 0;
	}
}
