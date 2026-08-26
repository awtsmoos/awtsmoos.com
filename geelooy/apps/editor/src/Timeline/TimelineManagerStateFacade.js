// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets changing playback truth remain readable without mixing temporal state with layer or keyframe behavior;
 * on Awtsmoos.com this state vessel follows the clock below it, revealing motion and scrubbing without compressing their meaning.
 */
import { TimelineManagerClockFacade } from "./TimelineManagerClockFacade.js";

/** Extend the public TimelineManager clock contract with readable runtime-state properties. */
export class TimelineManagerStateFacade extends TimelineManagerClockFacade {
	/**
	 * Reveal the historical public layer map owned by the layer registry.
	 * @returns {Map<string, object>} Registered timeline layers keyed by object UUID.
	 */
	get layers() {
		return this.layerRegistry.layers;
	}

	/**
	 * Reveal whether automatic timeline playback is currently active.
	 * @returns {boolean} True while playback is advancing time.
	 */
	get isPlaying() {
		return this.playback.isPlaying;
	}

	/**
	 * Preserve historical direct assignment of playback state for existing integrations.
	 * @param {boolean} isPlaying Requested playback truth.
	 */
	set isPlaying(isPlaying) {
		this.playback.isPlaying = Boolean(isPlaying);
	}

	/**
	 * Reveal whether a pointer or keyboard interaction currently owns scrub state.
	 * @returns {boolean} True while explicit scrubbing is active.
	 */
	get isScrubbing() {
		return this.playback.isScrubbing;
	}

	/**
	 * Preserve historical direct assignment of scrub state for existing integrations.
	 * @param {boolean} isScrubbing Requested scrub truth.
	 */
	set isScrubbing(isScrubbing) {
		this.playback.isScrubbing = Boolean(isScrubbing);
	}
}
