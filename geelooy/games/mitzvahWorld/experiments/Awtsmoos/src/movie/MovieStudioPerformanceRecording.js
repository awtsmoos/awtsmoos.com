// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceRecording.js
 * @description Governs arm, count, ranges, loops, voice, pause, cancel, retake, and atomic acceptance.
 * The Awtsmoos lets a live deed return to nothing or enter durable project memory; Awtsmoos.com
 * keeps cancellation empty and loop takes, selected clip, voice, history, autosave, and frame in one rhyme.
 */

import { acceptMovieStudioPerformanceRecording } from './MovieStudioPerformanceRecordingAcceptance.js';
import { createMovieStudioPerformanceRecorderOptions } from './MovieStudioPerformanceRecordingOptions.js';
import {
	toggleMovieStudioPerformanceRecording,
	updateMovieStudioPerformanceRecording
} from './MovieStudioPerformanceRecordingFlow.js';

export class MovieStudioPerformanceRecording {
	constructor(controller) {
		this.controller = controller;
		this.pendingAutomaticStop = null;
	}

	arm(options = {}) {
		const target = this.controller.selectedTarget();
		this.controller.state.arm(target);
		const recorderOptions = createMovieStudioPerformanceRecorderOptions(
			this.controller,
			options
		);
		const status = this.controller.recorder.arm(target, recorderOptions);
		this.pendingAutomaticStop = null;
		this.controller.renderStatus();
		return status;
	}

	async start(options = {}) {
		const phase = this.controller.recorder.status().phase;
		if (['idle', 'cancelled', 'stopped'].includes(phase)) {
			this.arm(options);
		}
		const countIn = Number(
			options.countIn
				?? this.controller.recorder.state.options.countIn
		) || 0;
		const status = countIn
			? await this.controller.recorder.countIn({ seconds: countIn })
			: await this.controller.recorder.start();
		this.controller.renderStatus();
		return status;
	}

	retake(options = {}) {
		const phase = this.controller.recorder.status().phase;
		if (!['idle', 'cancelled', 'stopped'].includes(phase)) {
			throw new Error(`PERFORMANCE_RETAKE_UNAVAILABLE:${phase}`);
		}
		return this.start(options);
	}

	pause() {
		const status = this.controller.recorder.pause();
		this.controller.input.reset('recording-paused');
		this.controller.renderStatus();
		return status;
	}

	async stop(options = {}) {
		const recorderOptions = this.controller.recorder.state.options;
		const result = await this.controller.recorder.stop(options);
		this.controller.input.reset('recording-stopped');
		const accepted = await acceptMovieStudioPerformanceRecording(
			this.controller,
			result,
			recorderOptions,
			options
		);
		this.controller.lastAcceptedTakeId = accepted.activeTake.id;
		this.controller.state.clearArm();
		this.pendingAutomaticStop = null;
		this.controller.renderStatus();
		return accepted;
	}

	cancel(reason = 'director-cancel') {
		const status = this.controller.recorder.cancel(reason);
		this.controller.input.reset('recording-cancelled');
		this.controller.state.clearArm(reason);
		this.pendingAutomaticStop = null;
		this.controller.renderStatus();
		return status;
	}

	toggle(options = {}) {
		return toggleMovieStudioPerformanceRecording(this, options);
	}

	update(deltaSeconds) {
		return updateMovieStudioPerformanceRecording(this, deltaSeconds);
	}
}
