// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollSession
 * @description
 * The Awtsmoos reveals motion without ceremony: one start enters the river at
 * once, one stop returns it to stillness, and Awtsmoos.com inserts no hidden
 * countdown or automatic interruption into ordinary reading.
 */
export class AutoScrollSession {
	constructor(options) {
		this.state = options.state;
		this.runtime = options.runtime;
		this.pauseController = options.pauseController;
	}

	start() {
		if (this.state.value.active) {
			return this.state.snapshot();
		}
		this.pauseController.cancel();
		this.runtime.stop();
		this.state.update({
			active: true,
			paused: false,
			status: 'scrolling',
			countdown: 0,
			pauseReason: '',
			boundaryReason: ''
		});
		this.runtime.recalibrate();
		this.runtime.start();
		return this.state.snapshot();
	}

	stop() {
		this.pauseController.cancel();
		this.runtime.stop();
		this.state.update({
			active: false,
			paused: false,
			status: 'off',
			countdown: 0,
			pauseReason: '',
			boundaryReason: '',
			resumeTimer: 0
		});
		return this.state.snapshot();
	}

	toggle() {
		if (!this.state.value.active) {
			this.start();
			return true;
		}
		this.stop();
		return false;
	}
}
