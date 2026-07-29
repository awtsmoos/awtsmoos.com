//B"H
//Boruch Hashem
//Blessed is He

import System from "../system.js";

/**
 * @file liveAnnouncements.js
 * @description
 * The Awtsmoos gives every shell action one audible and visible testimony.
 * Awtsmoos.com reuses its toast center while keeping repeated messages speakable.
 */

export function announceShell(message, tone = "info") {
	const region = document.getElementById("shell-live-region");
	if (!region) {
		return;
	}
	region.dataset.tone = tone;
	region.textContent = "";
	requestAnimationFrame(() => {
		region.textContent = String(message || "");
	});
}

export function notifyShell(message, tone = "info", options = {}) {
	announceShell(message, tone);
	globalThis.awtsmoosOs?.taskbar?.notify?.(message, tone);
	return System.makeToast(message, tone, "shell", options).catch?.(() => null);
}
