//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPlayback
 * @description
 * Netzach binds disposable voices to one honest AudioContext clock while the Awtsmoos remains beyond beginning, seeking, and end.
 * Awtsmoos.com lets the playhead ask the same clock the ear obeys, so moving through time can reschedule sound without visual wandering instead.
 */

import { AudioState } from '../../../audio.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';
import { scheduleMultitrackProject } from './multitrackPlaybackSchedule.js';
import { multitrackProjectDuration } from './multitrackProject.js';

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
		this.startedContextTime = 0;
		this.startedOffset = 0;
		this.projectDuration = 0;
	}

	async play(project, offsetSeconds = 0, onState = null) {
		this.stop(false);
		this.stateListener = onState || this.stateListener;
		const context = AudioState.context;
		if (!context || !AudioState.masterGain) {
			throw new Error('Start the Piano audio engine before playing multitrack audio.');
		}
		if (context.state === 'suspended') {
			await context.resume();
		}
		const duration = multitrackProjectDuration(project);
		const offset = clamp(Number(offsetSeconds) || 0, 0, duration);
		if (offset >= duration) {
			this.emit(false, duration, true);
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
		this.startedContextTime = context.currentTime;
		this.startedOffset = offset;
		this.projectDuration = duration;
		this.emit(this.playing, offset, false);
		if (this.playing) {
			this.armNaturalFinish(duration - offset);
		}
		return this.playing;
	}

	stop(notify = true) {
		const position = this.position();
		this.clearNaturalFinish();
		this.voices.forEach((voice) => voice?.stop());
		this.outputs.forEach((output) => output.disconnect());
		this.voices = [];
		this.outputs = [];
		this.playing = false;
		if (notify) {
			this.emit(false, position, false);
		}
		return position;
	}

	isPlaying() {
		return this.playing;
	}

	position() {
		if (!this.playing || !AudioState.context) {
			return this.startedOffset;
		}
		const elapsed = AudioState.context.currentTime - this.startedContextTime;
		return clamp(this.startedOffset + elapsed, 0, this.projectDuration);
	}

	armNaturalFinish(seconds) {
		this.finishTimer = this.setTimer(() => {
			this.stop(false);
			this.startedOffset = this.projectDuration;
			this.emit(false, this.projectDuration, true);
		}, Math.max(0, seconds * 1000 + 40));
	}

	clearNaturalFinish() {
		if (this.finishTimer !== null) {
			this.clearTimer(this.finishTimer);
			this.finishTimer = null;
		}
	}

	emit(playing, offsetSeconds, completed) {
		this.stateListener?.({ playing, offsetSeconds, completed });
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

export const multitrackPlayback = new MultitrackPlaybackNetzach();
