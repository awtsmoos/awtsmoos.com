// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioTranscript
 * @description
 * A hidden teaching is still real before it is opened. The Awtsmoos gives
 * Awtsmoos.com a named disclosure target whose state remains legible to every reader.
 */
import { createElement, toDomToken } from "../dom.js";

/** Returns the stable transcript panel identifier for one post model. */
export function transcriptPanelId(model) {
	return `cosmic-transcript-${toDomToken(model.id)}`;
}

/** Builds a disclosure button that degrades honestly when no transcript exists. */
export function createTranscriptButton(documentRef, model) {
	const transcript = String(model.raw?.transcript || "").trim();
	return createElement(documentRef, "button", "cosmic-utility-button", {
		type: "button",
		dataset: { transcriptToggle: model.id },
		"aria-controls": transcriptPanelId(model),
		"aria-expanded": "false",
		"aria-label": transcript ? "Toggle transcript" : "Transcript unavailable",
		disabled: !transcript,
		text: "Transcript"
	});
}

/** Builds the existing transcript as a named, initially collapsed region. */
export function createTranscriptPanel(documentRef, model) {
	const transcript = String(model.raw?.transcript || "").trim();
	if (!transcript) {
		return null;
	}
	return createElement(documentRef, "section", "cosmic-transcript", {
		id: transcriptPanelId(model),
		role: "region",
		"aria-label": "Audio transcript",
		dataset: { cosmicTranscript: model.id },
		hidden: true,
		text: transcript
	});
}
