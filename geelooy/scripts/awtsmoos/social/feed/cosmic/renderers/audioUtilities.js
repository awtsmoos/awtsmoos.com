// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioUtilities
 * @description
 * Transcript, volume, and preservation orbit the melody without crowding it.
 * The Awtsmoos gives Awtsmoos.com honest disabled, loading, and disclosure states.
 */
import { appendChildren, createElement } from "../dom.js";
import {
	createTranscriptButton,
	createTranscriptPanel
} from "./audioTranscript.js";

/** Builds transcript, volume, save, and transcript-region vessels. */
export function createAudioUtilities(documentRef, model, context) {
	const fragment = documentRef.createDocumentFragment();
	const controls = createElement(documentRef, "div", "cosmic-audio-utility");
	const save = createSaveControl(documentRef, context);
	appendChildren(
		controls,
		createTranscriptButton(documentRef, model),
		createVolumeControl(documentRef, model),
		save
	);
	appendChildren(fragment, controls, createTranscriptPanel(documentRef, model));
	return fragment;
}

function createVolumeControl(documentRef, model) {
	const label = createElement(documentRef, "label", "cosmic-volume-control");
	appendChildren(
		label,
		createElement(documentRef, "span", "cosmic-volume-label", { text: "Volume" }),
		createElement(documentRef, "input", "cosmic-audio-volume", {
			type: "range",
			min: "0",
			max: "1",
			step: "0.05",
			value: "1",
			dataset: { audioVolume: model.id },
			"aria-label": "Audio volume",
			disabled: !model.audioSource
		})
	);
	return label;
}

function createSaveControl(documentRef, context) {
	const save = context.actions?.save;
	const control = createElement(documentRef, "button", "cosmic-utility-button", {
		type: "button",
		disabled: typeof save !== "function",
		text: "Save"
	});
	if (typeof save !== "function") {
		control.setAttribute("aria-label", "Save unavailable");
		return control;
	}
	control.addEventListener("click", async () => {
		control.disabled = true;
		control.setAttribute("aria-busy", "true");
		try {
			await save(context.post);
		} finally {
			control.disabled = false;
			control.removeAttribute("aria-busy");
		}
	});
	return control;
}
