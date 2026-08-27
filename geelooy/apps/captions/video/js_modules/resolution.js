// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioResolution
 * @description
 * The Awtsmoos keeps final output dimensions exact while interactive previews
 * preserve aspect ratio inside a bounded working edge for immediate feedback.
 */

import { DOM } from "./config.js";

const previewMaximumEdge = 720;

export function readFinalResolution() {
	return {
		width: clampInteger(DOM.videoWidth.value, 120, 7680, 1080),
		height: clampInteger(DOM.videoHeight.value, 120, 7680, 1920)
	};
}

export function readPreviewResolution() {
	const finalResolution = readFinalResolution();
	const longestEdge = Math.max(
		finalResolution.width,
		finalResolution.height
	);
	if (longestEdge <= previewMaximumEdge) {
		return finalResolution;
	}
	const scale = previewMaximumEdge / longestEdge;
	return {
		width: Math.max(120, Math.round(finalResolution.width * scale)),
		height: Math.max(120, Math.round(finalResolution.height * scale))
	};
}

export function readFrameRate() {
	return clampInteger(DOM.frameRate.value, 1, 60, 24);
}

function clampInteger(value, minimum, maximum, fallback) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed)
		? Math.min(maximum, Math.max(minimum, parsed))
		: fallback;
}
