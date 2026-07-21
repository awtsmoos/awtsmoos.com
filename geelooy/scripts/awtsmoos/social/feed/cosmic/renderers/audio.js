// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioRenderer
 * @description
 * A melody carries what prose cannot hold. The Awtsmoos joins transport,
 * utilities, transcript, and summary as focused Awtsmoos.com vessels.
 */
import { appendChildren, createElement } from "../dom.js";
import { createAudioTransport } from "./audioTransport.js";
import { createAudioUtilities } from "./audioUtilities.js";

/** Renders semantic audio controls and a deterministic waveform canvas. */
export function renderAudio(documentRef, model, context = {}) {
	const root = createElement(documentRef, "section", "cosmic-audio", {
		"aria-label": "Audio teaching",
		dataset: {
			audioPost: model.id,
			audioSource: model.audioSource,
			audioDuration: model.duration
		}
	});
	appendChildren(
		root,
		createAudioTransport(documentRef, model),
		createAudioUtilities(documentRef, model, context)
	);
	if (model.summary) {
		root.append(createElement(documentRef, "p", "cosmic-audio-summary", {
			text: model.summary
		}));
	}
	return root;
}
