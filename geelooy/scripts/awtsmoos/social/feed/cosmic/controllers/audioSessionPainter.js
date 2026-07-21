// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AudioSessionPainter
 * @description
 * The Awtsmoos lets measured sound become a visible pulse without creating a
 * second source of truth. Awtsmoos.com owns one cancellable waveform frame.
 */
import { drawWaveform } from "./waveformPreview.js";

/** Owns the cancellable paint loop for one audio session. */
export class AudioSessionPainter {
	constructor(audio, canvas, root, analyser) {
		this.audio = audio;
		this.canvas = canvas;
		this.root = root;
		this.analyser = analyser;
		this.frame = 0;
		this.visible = true;
		this.seed = canvas?.dataset.waveformSeed || "";
		drawWaveform(canvas, this.seed);
	}

	setVisible(visible) {
		this.visible = Boolean(visible);
		if (this.visible && this.audio && !this.audio.paused) {
			this.paint();
		} else {
			this.cancel();
		}
	}

	paint() {
		this.cancel();
		if (!this.audio) {
			return;
		}
		const duration = this.audio.duration || Number(this.root.dataset.audioDuration) || 1;
		drawWaveform(
			this.canvas,
			this.seed,
			this.analyser?.read(),
			this.audio.currentTime / duration
		);
		if (!this.audio.paused && this.visible) {
			this.frame = requestAnimationFrame(() => this.paint());
		}
	}

	cancel() {
		if (this.frame) {
			cancelAnimationFrame(this.frame);
			this.frame = 0;
		}
	}

	destroy() {
		this.cancel();
		this.audio = null;
		this.canvas = null;
		this.analyser = null;
	}
}
