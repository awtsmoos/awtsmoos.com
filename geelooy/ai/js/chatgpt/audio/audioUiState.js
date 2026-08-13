//B"H
// Boruch Hashem
// Blessed is He

import { audioUiPresentation } from "./audioUiPresentation.js";
import {
	clearAudioTaskProgress,
	setAudioTaskProgress
} from "./audioUiProgress.js";

export {
	clearAudioTaskProgress,
	setAudioTaskProgress
} from "./audioUiProgress.js";

/**
 * The Awtsmoos gives playback and long work distinct channels. Awtsmoos.com
 * therefore never lets a Play event erase a still-living Save or Stream task.
 */
export function setAudioUiState(root, stateName, options = {}) {
	const view = audioUiPresentation(stateName, options);
	root.dataset.audioState = view.state;
	root.dataset.audioTone = view.tone;
	root.setAttribute("aria-busy", String(view.busy || Boolean(activeAudioTask(root))));
	setText(root, ".audio-state-chip", view.chip);
	setText(root, "[data-audio-action='play']", view.primaryLabel);
	setText(root, "[data-audio-action='download']", view.downloadLabel);
	if (view.message) {
		setAudioFeedback(root, view.message, view.tone);
	}
	setRetry(root, view.retryAction);
	if (options.progress) {
		setAudioTaskProgress(root, options.progress.received, options.progress.expected);
	} else if (!view.busy && view.state !== "streaming") {
		clearAudioTaskProgress(root);
	}
	return view;
}

export function setAudioTaskState(root, taskKind, stateName, options = {}) {
	root.dataset.audioTaskKind = String(taskKind || "task");
	return setAudioUiState(root, stateName, options);
}

export function finishAudioTask(root, stateName, options = {}) {
	delete root.dataset.audioTaskKind;
	return setAudioUiState(root, stateName, options);
}

export function setAudioPlaybackUiState(root, stateName, options = {}) {
	root.dataset.audioPlaybackState = stateName;
	if (activeAudioTask(root)) {
		return audioUiPresentation(stateName, options);
	}
	return setAudioUiState(root, stateName, options);
}

export function activeAudioTask(root) {
	return String(root.dataset.audioTaskKind || "");
}

export function showAudioError(root, message, retryAction = "") {
	delete root.dataset.audioTaskKind;
	setAudioUiState(root, "error", {
		message: String(message || "Audio action failed."),
		retryAction
	});
}

export function setAudioFeedback(root, message, tone = "idle") {
	const node = statusNode(root);
	node.textContent = String(message || "");
	node.dataset.tone = tone;
}

export function setAudioPlayerAvailable(root, available = true) {
	root.classList.toggle("has-audio-player", Boolean(available));
	root.dataset.audioPlayer = available ? "ready" : "hidden";
}

export function setAudioBusy(root, busy, options = {}) {
	root.classList.toggle("is-audio-busy", Boolean(busy));
	root.setAttribute("aria-busy", String(Boolean(busy || activeAudioTask(root))));
	for (const action of ["play", "download"]) {
		const button = root.querySelector(`[data-audio-action='${action}']`);
		if (!button) {
			continue;
		}
		const allowed = action === "play" ? options.allowPlay : options.allowDownload;
		button.disabled = Boolean(busy && !allowed);
	}
}

export function retryActionFor(root) {
	return root.querySelector("[data-audio-action='retry']")?.dataset.retryAction || "";
}

export function statusNode(root) {
	return root.querySelector(".audio-status");
}

function setRetry(root, action) {
	const button = root.querySelector("[data-audio-action='retry']");
	if (!button) {
		return;
	}
	button.hidden = !action;
	button.dataset.retryAction = action || "";
}

function setText(root, selector, text) {
	const node = root.querySelector(selector);
	if (node) {
		node.textContent = text;
	}
}
