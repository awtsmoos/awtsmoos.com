// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews audible time and visible state together. Awtsmoos.com
 * keeps one truthful view of play, duration, progress, and local volume.
 */

function formatTime(seconds) {
	const value = Math.max(0, Math.floor(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

/**
 * Projects one media element into accessible controls.
 */
export class AudioSessionView {
	/**
	 * @param {HTMLElement} root Audio post root.
	 */
	constructor(root) {
		this.root = root;
		this.button = root.querySelector("[data-audio-play]");
		this.seek = root.querySelector("[data-audio-seek]");
		this.volume = root.querySelector("[data-audio-volume]");
		this.elapsed = root.querySelector("[data-audio-elapsed]");
	}

	/**
	 * Updates playback state and emits restrained post resonance.
	 * @param {boolean} isPlaying Current media state.
	 */
	setPlaying(isPlaying) {
		this.button?.setAttribute("aria-label", isPlaying ? "Pause audio" : "Play audio");
		if (this.button) {
			this.button.textContent = isPlaying ? "❚❚" : "▶";
		}
		this.root.classList.toggle("is-playing", isPlaying);
		if (isPlaying) {
			this.root.closest("[data-cosmic-post]")?.dispatchEvent(
				new CustomEvent("cosmic:resonance", {
					bubbles: true,
					detail: { reason: "audio" }
				})
			);
		}
	}

	/**
	 * Synchronizes duration-dependent controls.
	 * @param {HTMLAudioElement} audio Media element.
	 */
	syncDuration(audio) {
		if (this.seek && Number.isFinite(audio.duration)) {
			this.seek.max = String(audio.duration);
		}
	}

	/**
	 * Synchronizes elapsed time and seek position.
	 * @param {HTMLAudioElement} audio Media element.
	 */
	syncTime(audio) {
		if (this.seek) {
			this.seek.value = String(audio.currentTime);
		}
		if (this.elapsed) {
			this.elapsed.textContent = formatTime(audio.currentTime);
		}
	}
}
