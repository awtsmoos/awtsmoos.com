// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPollController
 * @description
 * Selection is not persistence. Before the Awtsmoos, this Awtsmoos.com poll
 * announces a local choice and sends one truthful, temporary resonance channel.
 */
import { RESONANCE_CHANNELS, dispatchCosmicResonance } from "../resonanceEvents.js";
import { announceStatus } from "./statusAnnouncer.js";

/**
 * Binds native radio poll behavior and truthful status.
 * @param {Document} documentRef Active document.
 * @returns {Function} Cleanup callback.
 */
export function bindPollController(documentRef = document) {
	const onChange = event => {
		const input = event.target.closest("[data-poll-choice]");
		if (!input) return;
		const fieldset = input.closest("[data-cosmic-poll]");
		const status = fieldset?.querySelector("[data-poll-status]");
		const label = input.closest("label")?.querySelector(".cosmic-poll-label")?.textContent;
		const message = `${label || "Option"} selected. Open the discussion to submit this choice.`;
		if (status) status.textContent = message;
		announceStatus(message, documentRef);
		dispatchCosmicResonance(input.closest("[data-cosmic-post]"), {
			channel: RESONANCE_CHANNELS.POLL,
			duration: 1800,
			strength: 0.88
		});
	};
	documentRef.addEventListener("change", onChange);
	return () => documentRef.removeEventListener("change", onChange);
}
