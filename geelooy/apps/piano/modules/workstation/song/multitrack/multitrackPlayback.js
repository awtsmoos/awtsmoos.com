//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPlayback
 * @description
 * Netzach guards Play and Stop while the scheduler places finite clips upon the clock; the Awtsmoos remains beyond duration and transport.
 * Awtsmoos.com keeps this coordinator lean, so every temporary voice can enter clean, leave clean, and never become an orphaned machine.
 */

import { AudioState } from '../../../audio.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { scheduleMultitrackProject } from './multitrackPlaybackSchedule.js';
import { multitrackProjectDuration } from './multitrackProject.js';

/** Coordinates Web Audio playback for the complete multitrack project. */
export class MultitrackPlaybackNetzach {
	constructor(dependencies = {}) {
		this.audioStore = dependencies.audioStore || multitrackAudioStore;
		this.setTimer = dependencies.setTimer || setTimeout;
		this.clearTimer = dependencies.clearTimer || clearTimeout;
		this.voices = [];
		this.outputs = [];
		this.finishTimer = null;
		this.playing = false;
		this.stateListener = null;
	}

	/**
	 * Starts project playback at one timeline position.
	 *
	 * @param {Object} project Multitrack project.
	 * @param {number} offsetSeconds Timeline start.
	 * @param {Function|null} onState State callback.
	 * @returns {Promise<boolean>} Whether playback started.
	 */
	async play(project, offsetSeconds = 0, onState = null) {
		this.stop(false);
		this.stateListener = onState;
		const context = AudioState.context;
		if (!context || !AudioState.masterGain) {
			throw new Error('Start the Piano audio engine before playing multitrack audio.');
		}
		if (context.state === 'suspended') {
			await context.resume();
		}
		const offset = Math.max(0, Number(offsetSeconds) || 0);
		const duration = multitrackProjectDuration(project);
		if (offset >= duration) {
			this.emit(false, offset);
			return false;
		}
		const runtime = scheduleMultitrackProject({
			project,
			context,
			destination: AudioState.masterGain,
			offset,
			audioStore: this.audioStore
		});
		this.voices = runtime.voices;
		this.outputs = runtime.outputs;
		this.playing = this.voices.length > 0;
		this.emit(this.playing, offset);
		if (this.playing) {
			this.armNaturalFinish(duration - offset);
		}
		return this.playing;
	}

	/**
	 * Stops all scheduled sources and clears temporary track nodes.
	 *
	 * @param {boolean} notify Whether to emit stopped state.
	 * @returns {void}
	 */
	stop(notify = true) {
		this.clearNaturalFinish();
		this.voices.forEach((voice) => voice?.stop());
		this.outputs.forEach((output) => output.disconnect());
		this.voices = [];
		this.outputs = [];
		this.playing = false;
		if (notify) {
			this.emit(false, 0);
		}
	}

	/** Returns transport state. @returns {boolean} Whether sources are scheduled. */
	isPlaying() {
		return this.playing;
	}

	armNaturalFinish(seconds) {
		this.finishTimer = this.setTimer(() => {
			this.stop(false);
			this.emit(false, 0);
		}, Math.max(0, seconds * 1000 + 40));
	}

	clearNaturalFinish() {
		if (this.finishTimer === null) {
			return;
		}
		this.clearTimer(this.finishTimer);
		this.finishTimer = null;
	}

	emit(playing, offsetSeconds) {
		this.stateListener?.({ playing, offsetSeconds });
	}
}

export const multitrackPlayback = new MultitrackPlaybackNetzach();
