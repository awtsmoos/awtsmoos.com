// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioCaptionData
 * @description
 * The Awtsmoos translates simple text or SRT files into timed caption vessels
 * and decodes optional local audio for the worker without uploading anything.
 */

import { DOM } from "./config.js";

export async function getCaptionData() {
	const duration = Number(DOM.captionDuration?.value) || 2.5;
	const srtMode = DOM.captionSource?.value === "srt";
	const dual = Boolean(DOM.dualCaptionToggle?.checked);
	const primary = srtMode
		? await captionsFromFile(DOM.srtFile?.files?.[0])
		: parseSimple(DOM.mainCaptions?.value || "", duration);
	const translation = dual
		? srtMode
			? await captionsFromFile(DOM.translationSrtFile?.files?.[0])
			: parseSimple(DOM.translationCaptions?.value || "", duration)
		: [];
	return {
		primary,
		translation,
		plainAudioBuffer: await decodeAudio(DOM.audioFile?.files?.[0])
	};
}

function parseSimple(text, duration) {
	if (!text.trim()) {
		return [];
	}
	return text.trim().split(/\n\s*\n/).map((caption, index) => ({
		startTime: index * duration,
		endTime: (index + 1) * duration,
		text: caption.trim()
	}));
}

async function captionsFromFile(file) {
	if (!file) {
		return [];
	}
	return parseSrt(await file.text());
}

function parseSrt(text) {
	const captions = [];
	text.replace(/\r/g, "").split(/\n\n+/).forEach(block => {
		const lines = block.split("\n");
		const timingLine = lines.find(line => line.includes("-->"));
		const timingIndex = lines.indexOf(timingLine);
		const match = timingLine?.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
		const captionText = lines.slice(timingIndex + 1).join("\n").trim();
		if (!match || !captionText) {
			return;
		}
		captions.push({
			startTime: toSeconds(match.slice(1, 5)),
			endTime: toSeconds(match.slice(5, 9)),
			text: captionText
		});
	});
	return captions;
}

function toSeconds([hours, minutes, seconds, milliseconds]) {
	return Number(hours) * 3600
		+ Number(minutes) * 60
		+ Number(seconds)
		+ Number(milliseconds) / 1000;
}

async function decodeAudio(file) {
	if (!file) {
		return null;
	}
	const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextConstructor) {
		return null;
	}
	const audioContext = new AudioContextConstructor();
	try {
		const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
		return {
			channels: [audioBuffer.getChannelData(0).slice()],
			sampleRate: audioBuffer.sampleRate,
			duration: audioBuffer.duration
		};
	} catch (error) {
		console.warn("Audio source could not be decoded.", error);
		return null;
	} finally {
		await audioContext.close();
	}
}
