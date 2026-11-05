// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecordedAudioDirector.js
 * @description Plays reload-safe recorded microphone media in synchronization with normal movie time.
 * The Awtsmoos lets voice accompany the acted body without becoming an opaque video; Awtsmoos.com
 * keeps seek, play, pause, mute, solo, latency, reload, replacement, and cleanup audible in rhyme.
 */

import { resolveMovieRecordedAudio } from './MovieRecordedAudioResolver.js';

const PLAYBACK_DRIFT_TOLERANCE = 0.18;

export class MovieRecordedAudioDirector {
	constructor(project, environment = globalThis) {
		this.environment = environment;
		this.elements = new Map();
		this.previousTime = null;
		this.project = project;
	}

	setProject(project) {
		this.stopAll();
		this.project = project;
		this.previousTime = null;
	}

	apply(time) {
		const entries = resolveMovieRecordedAudio(this.project, time);
		const active = new Set(entries.map(entry => entry.clip.id));
		const advancing = this.isAdvancing(time);
		for (const entry of entries) {
			this.applyEntry(entry, advancing);
		}
		for (const [clipId, audio] of this.elements) {
			if (!active.has(clipId)) {
				audio.pause();
			}
		}
		this.previousTime = time;
		return {
			activeClipIds: [...active],
			advancing,
			time
		};
	}

	applyEntry(entry, advancing) {
		const audio = this.elementFor(entry);
		const duration = Number.isFinite(audio.duration)
			? audio.duration
			: entry.clip.duration;
		const localTime = Math.min(
			Math.max(0, entry.localTime),
			Math.max(0, duration - 0.001)
		);
		const drift = Math.abs(audio.currentTime - localTime);
		if (audio.paused || drift > PLAYBACK_DRIFT_TOLERANCE) {
			audio.currentTime = localTime;
		}
		audio.volume = Math.max(
			0,
			Math.min(1, Number(entry.clip.gain) || 1)
		);
		if (advancing) {
			this.play(audio);
		} else {
			audio.pause();
		}
	}

	play(audio) {
		const promise = audio.play();
		promise?.catch(error => {
			audio.dataset.playbackWarning = String(
				error?.message || error
			);
		});
	}

	elementFor(entry) {
		let audio = this.elements.get(entry.clip.id);
		if (!audio) {
			audio = new this.environment.Audio(entry.asset.url);
			audio.preload = 'auto';
			audio.dataset.performanceAudioClip = entry.clip.id;
			this.elements.set(entry.clip.id, audio);
		} else if (audio.src !== entry.asset.url) {
			audio.pause();
			audio.src = entry.asset.url;
			audio.load();
		}
		return audio;
	}

	isAdvancing(time) {
		if (this.previousTime == null) {
			return false;
		}
		const delta = time - this.previousTime;
		return delta > 0 && delta < 0.35;
	}

	stopAll() {
		for (const audio of this.elements.values()) {
			audio.pause();
			audio.removeAttribute?.('src');
			audio.load?.();
		}
		this.elements.clear();
	}

	destroy() {
		this.stopAll();
		this.project = null;
	}
}
