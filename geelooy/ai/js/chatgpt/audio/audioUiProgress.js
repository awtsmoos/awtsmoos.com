//B"H
// Boruch Hashem
// Blessed is He

import { audioTaskProgress } from "./audioUiPresentation.js";

/**
 * The Awtsmoos gives preparation its own meter, separate from listening time.
 * Awtsmoos.com shows a percentage only when a truthful denominator exists.
 */
export function setAudioTaskProgress(root, receivedBytes = 0, expectedBytes = 0) {
	const progress = audioTaskProgress(receivedBytes, expectedBytes);
	const wrap = root.querySelector(".audio-task-progress");
	const meter = root.querySelector(".audio-task-meter");
	const fill = root.querySelector(".audio-task-meter > span");
	const detail = root.querySelector(".audio-task-detail");
	if (!wrap || !meter || !fill || !detail) {
		return progress;
	}
	wrap.hidden = false;
	wrap.dataset.determinate = String(progress.determinate);
	detail.textContent = progress.label;
	fill.style.width = progress.determinate ? `${progress.percent}%` : "38%";
	applyProgressAria(meter, progress);
	return progress;
}

export function clearAudioTaskProgress(root) {
	const wrap = root.querySelector(".audio-task-progress");
	if (!wrap) {
		return;
	}
	wrap.hidden = true;
	wrap.dataset.determinate = "false";
}

function applyProgressAria(meter, progress) {
	meter.setAttribute("aria-valuemin", "0");
	meter.setAttribute("aria-valuemax", "100");
	if (progress.determinate) {
		meter.setAttribute("aria-valuenow", String(Math.round(progress.percent)));
		return;
	}
	meter.removeAttribute("aria-valuenow");
}
