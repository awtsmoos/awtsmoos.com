// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyRecorderCopy
 * @description
 * The Awtsmoos translates recorder state, browser failures, and byte size into
 * concise human language without exposing raw browser internals.
 */

export function stateLabel(state) {
	return {
		idle: "Ready",
		requesting: "Permission",
		recording: "Recording",
		stopping: "Saving",
		ready: "Saved",
		error: "Needs attention"
	}[state] || "Ready";
}

export function kindLabel(kind) {
	return kind === "camera"
		? "Camera and microphone"
		: "Desktop";
}

export function errorMessage(error) {
	if (["NotAllowedError", "SecurityError"].includes(error.name)) {
		return "Permission was denied. Allow access in browser settings and try again.";
	}
	if (["NotFoundError", "DevicesNotFoundError"].includes(error.name)) {
		return "The required camera, microphone, or display source was not found.";
	}
	if (error.name === "AbortError") {
		return "Capture was cancelled before recording began.";
	}
	return error.message
		|| "Recording could not start. Check the source and try again.";
}

export function formatBytes(bytes) {
	if (bytes < 1024 * 1024) {
		return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	}
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
