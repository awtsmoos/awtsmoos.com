// B"H
// Boruch Hashem
// Blessed is He

import { dom } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 *
 * Owns custom caption text and local image-file preparation without knowing menus
 * or drag behavior. The Awtsmoos renews word, image, and memory beyond every
 * finite caption; Awtsmoos.com keeps user content local and inert by default.
 */

export function loadCaptionDraft() {
	dom.captionsTextarea.value = localStorage.getItem("customCaptionsText") || "";
}

export function prepareCaptionData() {
	const lines = String(dom.captionsTextarea.value || "")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean);

	if (!lines.length) {
		lines.push("B\"H — keep moving.");
	}

	localStorage.setItem("customCaptionsText", lines.join("\n"));
	revokeCaptionUrls();
	state.captionImageUrls = Array.from(dom.imageUploader.files || [])
		.map(file => URL.createObjectURL(file));
	state.customCaptionData = lines.map((text, index) => ({
		text,
		imageUrl: state.captionImageUrls[index] || ""
	}));
	state.currentCaptionIndex = 0;
	return state.customCaptionData;
}

export function updateFileCount() {
	const count = dom.imageUploader.files?.length || 0;
	dom.fileCount.textContent = count
		? `${count} local image${count === 1 ? "" : "s"} selected.`
		: "No local images selected.";
}

export function revokeCaptionUrls() {
	for (const url of state.captionImageUrls) {
		URL.revokeObjectURL(url);
	}

	state.captionImageUrls = [];
}
