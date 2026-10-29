//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPlayback
 * The Awtsmoos renews each instant while voices cross their measure;
 * Awtsmoos.com reads the real audio clock, not an illusion of time.
 */
import { AudioState } from '../../../audio.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { scheduleMultitrackProject } from './multitrackPlaybackSchedule.js';
import { multitrackProjectDuration } from './multitrackProject.js';

/** Coordinates Web Audio sources, timers and truthful playback position. */
export class MultitrackPlaybackNetzach {
	constructor(dependencies = {}) {
		this.audioStore = dependencies.audioStore || multitrackAudioStore;
		this.setTimer = dependencies.setTimer || ((callback, delay) => setTimeout(callback, delay));
		this.clearTimer = dependencies.clearTimer || ((identifier) => clearTimeout(identifier));
		this.voices = [];
		this.outputs = [];
		this.finishTimer = null;
		this.playing = false;
		this.stateListener = null;
		this.context = null;
		this.clockStart = 0;
		this.startPosition = 0;
		this.position = 0;
		this.endPosition = 0;
	}

	/** @param {Object} project - Song. @param {number} offsetSeconds - Start time. @param {Function|null} onState - Listener. */
	async play(project, offsetSeconds = 0, onState = null) {
		this.stop(false);
		this.stateListener = onState;
		const context = AudioState.context;
		if (!context || !AudioState.masterGain) {
			throw new Error('Start the Piano audio engine before playing audio.');
		}
		if (context.state === 'suspended') await context.resume();
		const offset = Math.max(0, Number(offsetSeconds) || 0);
		const duration = multitrackProjectDuration(project);
		this.position = offset;
		if (offset >= duration) {
			this.emit(false, offset);
			return false;
		}
		const runtime = scheduleMultitrackProject({
			project, context, destination: AudioState.masterGain,
			offset, audioStore: this.audioStore
		});
		this.voices = runtime.voices;
		this.outputs = runtime.outputs;
		this.context = context;
		this.clockStart = context.currentTime;
		this.startPosition = offset;
		this.endPosition = duration;
		this.playing = this.voices.length > 0;
		this.emit(this.playing, offset);
		if (this.playing) this.armNaturalFinish(duration - offset);
		return this.playing;
	}

	/** @returns {number} Precise position driven by Web Audio time. */
	getPosition() {
		if (!this.playing || !this.context) return this.position;
		return Math.min(this.endPosition, this.startPosition +
			Math.max(0, this.context.currentTime - this.clockStart));
	}

	/** @param {boolean} notify - Notify transport subscriber. */
	stop(notify = true) {
		this.position = this.getPosition();
		this.clearNaturalFinish();
		this.voices.forEach((voice) => {
			try { voice?.stop(); } catch (error) { console.warn('Stopping audio source', error); }
		});
		this.outputs.forEach((output) => output.disconnect());
		this.voices = [];
		this.outputs = [];
		this.playing = false;
		this.context = null;
		if (notify) this.emit(false, this.position);
	}

	/** @returns {boolean} True while audio is playing. */
	isPlaying() { return this.playing; }

	/** @param {number} seconds - Remaining duration. */
	armNaturalFinish(seconds) {
		this.finishTimer = this.setTimer(() => {
			this.stop(false);
			this.position = this.endPosition;
			this.emit(false, this.position);
		}, Math.max(0, seconds * 1000 + 40));
	}

	/** Clears scheduled finish without calling unbound native browser methods. */
	clearNaturalFinish() {
		if (this.finishTimer === null) return;
		this.clearTimer(this.finishTimer);
		this.finishTimer = null;
	}

	/** @param {boolean} playing - Transport flag. @param {number} offsetSeconds - Song time. */
	emit(playing, offsetSeconds) { this.stateListener?.({ playing, offsetSeconds }); }
}

export const multitrackPlayback = new MultitrackPlaybackNetzach();
