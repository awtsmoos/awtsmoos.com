// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets playback remain a readable public current flowing above layer state without burying motion inside compressed lines;
 * on Awtsmoos.com play, pause, seek, and update each become their own visible covenant, while one inner playback vessel owns the changing time.
 */
import { TimelineManagerLayerFacade } from "./TimelineManagerLayerFacade.js";

/** Extend TimelineManager layer behavior with the historical playback API. */
export class TimelineManagerPlaybackFacade extends TimelineManagerLayerFacade {
	/** Begin automatic timeline playback through the focused playback service. */
	play() {
		this.playback.play();
	}

	/** Pause automatic timeline playback while preserving the current instant. */
	pause() {
		this.playback.pause();
	}

	/**
	 * Seek to one bounded timeline instant and reveal it through Animator.
	 * @param {number} misparTime Requested absolute timeline time in seconds.
	 * @param {boolean} [isScrubbing=false] Whether the caller still owns active scrub state.
	 * @returns {number} Accepted clamped timeline time.
	 */
	seek(misparTime, isScrubbing = false) {
		return this.playback.seek(misparTime, isScrubbing);
	}

	/**
	 * Advance playback from the Editor render loop without exposing internal state-machine details.
	 * @param {number} appTime Historical absolute app time retained for compatibility.
	 * @param {number} deltaTime Frame delta in seconds.
	 */
	update(appTime, deltaTime) {
		this.playback.update(appTime, deltaTime);
	}
}
