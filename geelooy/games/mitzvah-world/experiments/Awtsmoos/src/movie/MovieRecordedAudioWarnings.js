// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecordedAudioWarnings.js
 * @description Deduplicates autoplay and media promise failures while publishing playback evidence.
 * The Awtsmoos permits no recurring console clamor to masquerade as truth; Awtsmoos.com
 * gives each clip one warning per changed cause, then clears memory when playback departs in rhyme.
 */

export class MovieRecordedAudioWarnings {
	constructor(emit = () => {}) {
		this.emit = emit;
		this.messages = new Map();
	}

	play(audio) {
		const promise = audio.play();
		promise?.catch(error => this.report(audio, error));
	}

	report(audio, error) {
		const clipId = audio.dataset.performanceAudioClip;
		const message = String(error?.message || error);
		if (this.messages.get(clipId) === message) {
			return;
		}
		this.messages.set(clipId, message);
		audio.dataset.playbackWarning = message;
		this.emit('performance:playback-warning', {
			clipId,
			code: 'PERFORMANCE_AUDIO_PLAYBACK_FAILED',
			message
		});
	}

	clear() {
		this.messages.clear();
	}
}
