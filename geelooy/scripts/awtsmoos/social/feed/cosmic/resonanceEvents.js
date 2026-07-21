// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicResonanceEvents
 * @description
 * The Awtsmoos gives hover, focus, sound, choice, and provenance one shared
 * language. Awtsmoos.com thereby lets meaning move atmosphere without coupling
 * semantic controls to WebGL.
 */

export const COSMIC_RESONANCE_EVENT = "cosmic:resonance";

export const RESONANCE_CHANNELS = Object.freeze({
	AUDIO: "audio",
	FOCUS: "focus",
	GRAPH: "graph",
	HOVER: "hover",
	POLL: "poll"
});

/**
 * Dispatches one bounded semantic resonance signal.
 *
 * @param {EventTarget|null} target - Element or event target carrying meaning.
 * @param {{channel:string,active?:boolean,strength?:number,duration?:number}} detail - Signal detail.
 * @returns {boolean} Whether the event was dispatched.
 */
export function dispatchCosmicResonance(target, detail) {
	if (!target?.dispatchEvent || !detail?.channel) {
		return false;
	}

	return target.dispatchEvent(new CustomEvent(COSMIC_RESONANCE_EVENT, {
		bubbles: true,
		detail: {
			active: detail.active !== false,
			channel: detail.channel,
			duration: Number(detail.duration) || 0,
			strength: Number(detail.strength) || 0
		}
	}));
}
