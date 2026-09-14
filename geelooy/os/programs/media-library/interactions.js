//B"H
//Boruch Hashem
//Blessed be He

import { copyMediaUrl, openMediaUrl } from "./assetActions.js";
import { mediaRecord, saveImgbbKey } from "./storage.js";
import { setMediaStatus } from "./status.js";

/**
 * Turns an existing public URL into metadata without fetching or storing bytes.
 * A distant image enters Awtsmoos.com as a path of light, not a hidden payload.
 */
export function importedMediaRecord(raw, category, origin = location.origin) {
	const source = String(raw || "").trim();
	if (!source) {
		throw new Error("Paste an image URL first.");
	}
	const url = new URL(source, origin);
	if (!/^https?:$/.test(url.protocol)) {
		throw new Error("Only http/https URLs are supported.");
	}
	return mediaRecord({
		url: url.href,
		provider: "url",
		category
	});
}

/** Maps the filter's broad view back to the metadata category used for uploads. */
export function selectedMediaCategory(value) {
	return value === "All" ? "Other" : value;
}

/** Stores or clears the ImgBB key only in the browser credential slot. */
export function saveBrowserImgbbKey(input, status) {
	const saved = saveImgbbKey(input.value);
	setMediaStatus(
		status,
		saved ? "ImgBB API key saved in this browser only." : "Saved ImgBB API key cleared."
	);
}

/** Connects drag-and-drop selection without starting network work automatically. */
export function wireMediaDrop(zone, selectFiles) {
	zone.ondragover = function allowMediaDrop(event) {
		event.preventDefault();
	};
	zone.ondrop = function receiveMediaDrop(event) {
		event.preventDefault();
		selectFiles(event.dataTransfer?.files);
	};
}

/**
 * Dispatches card actions while removal remains local-only and reversible remotely.
 */
export async function handleMediaAction(event, items, status, removeItem) {
	const button = event.target.closest("[data-media-action]");
	if (!button) {
		return;
	}
	const item = items.find(function matchesButtonId(value) {
		return value.id === button.dataset.mediaId;
	});
	if (!item) {
		return;
	}
	if (button.dataset.mediaAction === "copy") {
		await copyMediaUrl(item, status);
	}
	if (button.dataset.mediaAction === "open") {
		openMediaUrl(item, status);
	}
	if (button.dataset.mediaAction === "remove") {
		removeItem(item.id);
		setMediaStatus(
			status,
			"Removed from this browser library. Remote image remains untouched."
		);
	}
}
