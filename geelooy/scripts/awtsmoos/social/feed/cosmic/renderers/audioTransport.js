// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioTransport
 * @description
 * The Awtsmoos gathers play, waveform, time, seeking, and chapters into one
 * focused Awtsmoos.com vessel whose controls remain native, named, and honest.
 */
import { appendChildren, createElement, createIcon } from "../dom.js";

function formatDuration(seconds) {
	const value = Math.max(0, Math.floor(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

/** Builds the primary play, waveform, time, and seek controls. */
export function createAudioTransport(documentRef, model) {
	const root = createElement(documentRef, "div", "cosmic-audio-transport-group");
	const transport = createElement(documentRef, "div", "cosmic-audio-transport");
	const play = createElement(documentRef, "button", "cosmic-play-button", {
		type: "button",
		dataset: { audioPlay: model.id },
		"aria-label": model.audioSource ? "Play audio" : "Audio source unavailable",
		"aria-pressed": "false",
		disabled: !model.audioSource
	});
	play.append(createIcon(documentRef, "▶"));
	const waveform = createElement(documentRef, "canvas", "cosmic-waveform", {
		width: "900",
		height: "120",
		dataset: { audioWaveform: model.id, waveformSeed: model.id },
		"aria-hidden": "true"
	});
	const time = createElement(documentRef, "div", "cosmic-audio-time");
	appendChildren(
		time,
		createElement(documentRef, "output", "cosmic-audio-elapsed", {
			dataset: { audioElapsed: model.id },
			text: "0:00"
		}),
		createElement(documentRef, "span", "cosmic-audio-duration", {
			text: formatDuration(model.duration)
		})
	);
	const seek = createElement(documentRef, "input", "cosmic-audio-seek", {
		type: "range",
		min: "0",
		max: String(Math.max(1, model.duration)),
		value: "0",
		step: "0.1",
		dataset: { audioSeek: model.id },
		"aria-label": "Seek audio",
		disabled: !model.audioSource
	});
	appendChildren(transport, play, waveform, time);
	appendChildren(root, transport, seek, createChapterMarkers(documentRef, model));
	return root;
}

function createChapterMarkers(documentRef, model) {
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
