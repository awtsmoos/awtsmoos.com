// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioSession
 * @description
 * The Awtsmoos sustains sound, listener, analyser, and frame without leaking a
 * ghost. Awtsmoos.com binds one real source to one accessible transport.
 */
import { RESONANCE_CHANNELS, dispatchCosmicResonance } from "../resonanceEvents.js";
import { AudioSessionAnalyser } from "./audioSessionAnalyser.js";
import { bindAudioSession } from "./audioSessionBindings.js";
import { AudioSessionPainter } from "./audioSessionPainter.js";
import { AudioSessionView } from "./audioSessionView.js";

/** Owns playback and analyser state for one audio post. */
export class AudioSession {
	constructor(root, audioContext) {
		this.root = root;
		this.audio = root.dataset.audioSource ? new Audio(root.dataset.audioSource) : null;
		this.audioContext = audioContext;
		this.graph = this.audio ? new AudioSessionAnalyser(this.audio, audioContext) : null;
		this.view = new AudioSessionView(root);
		this.canvas = root.querySelector("[data-audio-waveform]");
		this.painter = new AudioSessionPainter(this.audio, this.canvas, root, this.graph);
		this.unbind = bindAudioSession(this);
	}

	seek() {
		if (!this.audio || !this.view.seek) {
			return;
		}
		this.audio.currentTime = Number(this.view.seek.value);
		this.painter.paint();
	}

	setVolume() {
		if (this.audio && this.view.volume) {
			this.audio.volume = Number(this.view.volume.value);
		}
	}

	seekChapter(event) {
		const marker = event.target.closest("[data-chapter-time]");
		if (!marker || !this.audio) {
			return;
		}
		this.audio.currentTime = Number(marker.dataset.chapterTime || 0);
		this.emit(true, 0.9, 1200);
	}

	async toggle() {
		if (!this.audio) {
			return;
		}
		if (!this.audio.paused) {
			this.audio.pause();
			this.setPlaying(false);
			return;
		}
		await this.audioContext?.resume();
		this.graph?.connect();
		try {
			await this.audio.play();
			this.setPlaying(true);
		} catch {
			this.setPlaying(false);
		}
	}

	setPlaying(isPlaying) {
		this.view.setPlaying(isPlaying);
		this.emit(isPlaying, 0.94);
		if (isPlaying) {
			this.painter.paint();
		} else {
			this.painter.cancel();
		}
	}

	setVisible(visible) {
		this.painter.setVisible(visible);
	}

	emit(active, strength = 0, duration = 0) {
		dispatchCosmicResonance(this.root, {
			active,
			channel: RESONANCE_CHANNELS.AUDIO,
			duration,
			strength
		});
	}

	destroy() {
		this.unbind();
		this.painter.destroy();
		this.audio?.pause();
		this.graph?.destroy();
		this.emit(false);
	}
}
