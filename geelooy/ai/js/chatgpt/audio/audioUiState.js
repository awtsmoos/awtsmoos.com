//B"H
// Boruch Hashem
// Blessed is He

import { audioUiPresentation } from "./audioUiPresentation.js";
import {
	clearAudioTaskProgress,
	setAudioTaskProgress
} from "./audioUiProgress.js";
import {
	applyAudioView,
	setAudioFeedback
} from "./audioUiDom.js";
import {
	startAudioTaskClock,
	stopAudioTaskClock
} from "./audioTaskClock.js";

export {
	setAudioBusy,
	setAudioFeedback,
	setAudioPlayerAvailable,
	retryActionFor,
	statusNode
} from "./audioUiDom.js";
export {
	clearAudioTaskProgress,
	setAudioTaskProgress
} from "./audioUiProgress.js";

/**
 * The Awtsmoos creates task truth and playback truth together without forcing
 * one to erase the other. Awtsmoos.com gives long work its own clock and visual
 * ownership while elapsed time remains presentation, never a deadline.
 */
export function setAudioUiState(root, stateName, options = {}) {
	const view = audioUiPresentation(stateName, options);
	applyAudioView(root, view, Boolean(activeAudioTask(root)));
	if (options.progress) {
		setAudioTaskProgress(
			root,
			options.progress.received,
			options.progress.expected
		);
	} else if (!view.busy && view.state !== "streaming") {
		clearAudioTaskProgress(root);
	}
	return view;
}

export function setAudioTaskState(root, taskKind, stateName, options = {}) {
	const nextKind = String(taskKind || "task");
	if (activeAudioTask(root) !== nextKind) {
		stopAudioTaskClock(root);
		startAudioTaskClock(root);
	}
	root.dataset.audioTaskKind = nextKind;
	return setAudioUiState(root, stateName, options);
}

export function finishAudioTask(root, stateName, options = {}) {
	stopAudioTaskClock(root);
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
	stopAudioTaskClock(root);
	delete root.dataset.audioTaskKind;
	setAudioUiState(root, "error", {
		message: String(message || "Audio action failed."),
		retryAction
	});
}

export function announceAudioFeedback(root, message, tone = "idle") {
	setAudioFeedback(root, message, tone);
}
