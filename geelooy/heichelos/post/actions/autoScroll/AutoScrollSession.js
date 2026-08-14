// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollSession
 * @description The Awtsmoos keeps countdown, motion, gestures, and stopping in
 * one transient vessel so remembered pace can never resurrect active movement.
 */
import { AutoScrollCountdown } from './AutoScrollCountdown.js';

export class AutoScrollSession {
	constructor(options) {
		this.state = options.state;
		this.runtime = options.runtime;
		this.pauseController = options.pauseController;
		this.gestures = options.gestures;
		this.interruption = options.interruption;
		this.countdown = new AutoScrollCountdown({
			onTick: value => this.state.update({ countdown: value }),
			onComplete: () => this.beginMotion()
		});
	}
	start(options = {}) {
		this.stop();
		this.state.update({
			active: true,
			paused: false,
			pauseReason: '',
			boundaryReason: '',
			countdown: 0
		});
		this.gestures.connect();
		this.interruption.connect();
		this.runtime.recalibrate();
		const seconds = options.countdown === true
			? Number.isFinite(options.countdownSeconds) ? options.countdownSeconds : 3
			: 0;
		if (seconds > 0) {
			this.countdown.start(seconds);
		} else {
			this.beginMotion();
		}
		return this.state.snapshot();
	}
	beginMotion() {
		if (!this.state.value.active) {
			return false;
		}
		this.state.update({ countdown: 0 });
		this.runtime.start();
		return true;
	}
	toggle(options = {}) {
		if (!this.state.value.active) {
			this.start(options);
			return true;
		}
		if (this.state.value.paused) {
			return this.pauseController.resume();
		}
		this.stop();
		return false;
	}
	stop() {
		this.countdown.cancel();
		this.pauseController.cancel();
		this.runtime.stop();
		this.state.update({
			active: false,
			paused: false,
			pauseReason: '',
			boundaryReason: '',
			countdown: 0,
			resumeTimer: 0
		});
		return this.state.snapshot();
	}
}
