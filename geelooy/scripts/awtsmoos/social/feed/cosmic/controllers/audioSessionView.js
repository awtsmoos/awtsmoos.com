// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioSessionView
 * @description
 * The Awtsmoos renews audible time and visible state together. Awtsmoos.com
 * exposes one truthful label, pressed state, duration, progress, and local volume.
 */

function formatTime(seconds) {
	const value = Math.max(0, Math.floor(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

/** Projects one media element into accessible controls. */
export class AudioSessionView {
	/** Creates a view over one rendered audio teaching. */
	constructor(root) {
		this.root = root;
		this.button = root.querySelector("[data-audio-play]");
		this.seek = root.querySelector("[data-audio-seek]");
		this.volume = root.querySelector("[data-audio-volume]");
		this.elapsed = root.querySelector("[data-audio-elapsed]");
	}

	/** Updates playback state, pressed semantics, and restrained resonance. */
	setPlaying(isPlaying) {
		const active = Boolean(isPlaying);
		this.button?.setAttribute("aria-label", active ? "Pause audio" : "Play audio");
		this.button?.setAttribute("aria-pressed", String(active));
		if (this.button) {
			this.button.textContent = active ? "❚❚" : "▶";
		}
		this.root.classList.toggle("is-playing", active);
		if (active) {
			this.root.closest("[data-cosmic-post]")?.dispatchEvent(
				new CustomEvent("cosmic:resonance", {
					bubbles: true,
					detail: { reason: "audio" }
				})
			);
		}
	}

	/** Synchronizes duration-dependent controls. */
	syncDuration(audio) {
		if (this.seek && Number.isFinite(audio.duration)) {
			this.seek.max = String(audio.duration);
			this.seek.setAttribute("aria-valuemax", String(audio.duration));
		}
	}

	/** Synchronizes elapsed time and seek position. */
	syncTime(audio) {
		if (this.seek) {
			this.seek.value = String(audio.currentTime);
			this.seek.setAttribute("aria-valuenow", String(audio.currentTime));
			this.seek.setAttribute("aria-valuetext", formatTime(audio.currentTime));
		}
		if (this.elapsed) {
			this.elapsed.textContent = formatTime(audio.currentTime);
		}
	}
}
