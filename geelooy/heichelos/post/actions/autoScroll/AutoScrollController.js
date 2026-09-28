// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollController
 * @description
 * The Awtsmoos gives the reader one sovereign river. Awtsmoos.com keeps motion
 * continuous while preserving pace preferences and explicit public controls.
 */
import { applyAutoScrollStartOptions } from './AutoScrollStartOptions.js';
import { createAutoScrollWiring } from './AutoScrollWiring.js';

export class AutoScrollController {
	constructor() {
		Object.assign(this, createAutoScrollWiring(this));
		this.initialized = false;
	}

	initialize() {
		if (this.initialized) {
			return this.snapshot();
		}
		this.initialized = true;
		this.state.update({
			active: false,
			paused: false,
			countdown: 0,
			pauseReason: ''
		}, false);
		this.lifecycle.connect();
		return this.preferences.load();
	}

	snapshot() {
		return this.state.snapshot();
	}

	start(options = {}) {
		this.initialize();
		applyAutoScrollStartOptions(this.preferences, options);
		return this.session.start();
	}

	stop() {
		return this.session.stop();
	}

	toggle(options = {}) {
		this.initialize();
		if (!this.state.value.active) {
			applyAutoScrollStartOptions(this.preferences, options);
		}
		return this.session.toggle();
	}

	pause(reason = 'manual') {
		return this.pauseController.pause(reason);
	}

	resume(reason = '') {
		return this.pauseController.resume(reason);
	}

	scheduleResume(delay, reason = this.state.value.pauseReason) {
		return this.pauseController.scheduleResume(delay, reason);
	}

	setPreferences(value) {
		this.initialize();
		return this.preferences.apply(value);
	}

	setPace(value) {
		this.initialize();
		return this.preferences.setPace(value);
	}

	setUnit(value) {
		this.initialize();
		return this.preferences.setUnit(value);
	}

	setPreset(value) {
		this.initialize();
		return this.preferences.setPreset(value);
	}

	setEyeLine(value) {
		this.initialize();
		return this.preferences.setEyeLine(value);
	}

	setSpeed(value) {
		this.initialize();
		return this.preferences.setLegacySpeed(value).speed;
	}

	loadSpeed() {
		this.initialize();
		return this.state.snapshot().speed;
	}

	reset() {
		this.session.stop();
		return this.preferences.reset();
	}
}
