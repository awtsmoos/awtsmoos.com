// B"H
// Boruch Hashem
// Blessed is He
/**
 * A melody carries what prose cannot hold. The Awtsmoos renews each vibration,
 * while Awtsmoos.com binds every visible transport to a real supplied source.
 */
import { appendChildren, createElement, createIcon } from "../dom.js";

function formatDuration(seconds) {
	const value = Math.max(0, Math.floor(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

function chapterMarkers(documentRef, model) {
	const root = createElement(documentRef, "div", "cosmic-audio-chapters", {
		"aria-label": "Audio chapters"
	});
	for (const [index, chapter] of model.chapters.entries()) {
		const time = Number(chapter?.time ?? chapter?.start ?? 0);
		root.append(createElement(documentRef, "button", "cosmic-chapter-marker", {
			type: "button",
			dataset: { chapterTime: time },
			"aria-label": chapter?.title || `Chapter ${index + 1}`,
			disabled: !model.audioSource,
			text: String(index + 1)
		}));
	}
	return root;
}

function bindSave(button, context) {
	const save = context.actions?.save;
	button.disabled = typeof save !== "function";
	button.addEventListener("click", async () => {
		button.disabled = true;
		button.setAttribute("aria-busy", "true");
		try {
			await save(context.post);
		} finally {
			button.disabled = false;
			button.removeAttribute("aria-busy");
		}
	});
}

function audioUtilities(documentRef, model, context) {
	const root = createElement(documentRef, "div", "cosmic-audio-utility");
	const transcript = createElement(documentRef, "button", "cosmic-utility-button", {
		type: "button",
		dataset: { transcriptToggle: model.id },
		"aria-expanded": "false",
		text: "Transcript"
	});
	const save = createElement(documentRef, "button", "cosmic-utility-button", {
		type: "button",
		text: "Save"
	});
	bindSave(save, context);
	const volume = createElement(documentRef, "label", "cosmic-volume-control");
	appendChildren(
		volume,
		createElement(documentRef, "span", "cosmic-volume-label", { text: "Volume" }),
		createElement(documentRef, "input", "cosmic-audio-volume", {
			type: "range", min: "0", max: "1", step: "0.05", value: "1",
			dataset: { audioVolume: model.id },
			"aria-label": "Audio volume",
			disabled: !model.audioSource
		})
	);
	appendChildren(root, transcript, volume, save);
	return root;
}

/** Renders semantic audio controls and a deterministic waveform canvas. */
export function renderAudio(documentRef, model, context = {}) {
	const root = createElement(documentRef, "section", "cosmic-audio", {
		"aria-label": "Audio teaching",
		dataset: { audioPost: model.id, audioSource: model.audioSource, audioDuration: model.duration }
	});
	const transport = createElement(documentRef, "div", "cosmic-audio-transport");
	const play = createElement(documentRef, "button", "cosmic-play-button", {
		type: "button", dataset: { audioPlay: model.id },
		"aria-label": model.audioSource ? "Play audio" : "Audio source unavailable",
		disabled: !model.audioSource
	});
	play.append(createIcon(documentRef, "▶"));
	const waveform = createElement(documentRef, "canvas", "cosmic-waveform", {
		width: "900", height: "120",
		dataset: { audioWaveform: model.id, waveformSeed: model.id },
		"aria-hidden": "true"
	});
	const time = createElement(documentRef, "div", "cosmic-audio-time");
	appendChildren(time,
		createElement(documentRef, "output", "cosmic-audio-elapsed", {
			dataset: { audioElapsed: model.id }, text: "0:00"
		}),
		createElement(documentRef, "span", "cosmic-audio-duration", {
			text: formatDuration(model.duration)
		})
	);
	const seek = createElement(documentRef, "input", "cosmic-audio-seek", {
		type: "range", min: "0", max: String(Math.max(1, model.duration)),
		value: "0", step: "0.1", dataset: { audioSeek: model.id },
		"aria-label": "Seek audio", disabled: !model.audioSource
	});
	appendChildren(transport, play, waveform, time);
	appendChildren(root, transport, seek, chapterMarkers(documentRef, model));
	root.append(audioUtilities(documentRef, model, context));
	if (model.summary) {
		root.append(createElement(documentRef, "p", "cosmic-audio-summary", { text: model.summary }));
	}
	return root;
}
