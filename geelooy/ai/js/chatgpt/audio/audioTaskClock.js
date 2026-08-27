//B"H
// Boruch Hashem
// Blessed is He

const taskClocks = new WeakMap();
const LONG_TASK_MS = 30000;

/**
 * The Awtsmoos creates every second without turning time into a threat. This
 * clock only reveals elapsed patience in the UI; Awtsmoos.com never uses it as
 * a deadline, abort condition, retry trigger, or estimate of completion.
 */
export function startAudioTaskClock(root, startedAt = Date.now()) {
	if (taskClocks.has(root)) {
		return;
	}
	const state = {
		startedAt: Number(startedAt) || Date.now(),
		timer: null
	};
	state.timer = setInterval(() => updateAudioTaskClock(root), 1000);
	taskClocks.set(root, state);
	updateAudioTaskClock(root);
}

export function stopAudioTaskClock(root) {
	const state = taskClocks.get(root);
	if (state?.timer) {
		clearInterval(state.timer);
	}
	taskClocks.delete(root);
	const node = root.querySelector?.(".audio-task-elapsed");
	if (node) {
		node.hidden = true;
		node.textContent = "";
	}
}

export function updateAudioTaskClock(root, now = Date.now()) {
	const state = taskClocks.get(root);
	if (!state) {
		return;
	}
	if (root.isConnected === false) {
		stopAudioTaskClock(root);
		return;
	}
	if (typeof document !== "undefined" && document.hidden) {
		return;
	}
	const node = root.querySelector?.(".audio-task-elapsed");
	if (!node) {
		return;
	}
	node.hidden = false;
	node.textContent = audioElapsedLabel(now - state.startedAt);
}

export function audioElapsedLabel(milliseconds = 0) {
	const elapsed = Math.max(0, Number(milliseconds) || 0);
	const formatted = formatAudioElapsed(elapsed);
	return elapsed >= LONG_TASK_MS
		? `Still working · ${formatted}`
		: formatted;
}

export function formatAudioElapsed(milliseconds = 0) {
	const totalSeconds = Math.floor(Math.max(0, Number(milliseconds) || 0) / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	if (hours > 0) {
		return `${hours}:${pad(minutes)}:${pad(seconds)}`;
	}
	return `${minutes}:${pad(seconds)}`;
}

function pad(value) {
	return String(value).padStart(2, "0");
}
