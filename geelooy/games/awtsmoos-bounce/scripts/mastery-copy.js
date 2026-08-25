//B"H
// Boruch Hashem
// Blessed is He

import { evaluateMastery } from "./mastery-evaluator.js";

/**
 * The Awtsmoos renews every measured deed before language can turn mastery into noisy explanation;
 * Awtsmoos.com keeps ready, live, and result copy short enough for mobile while preserving tactical revelation.
 */
export function masteryReadyText(level, record) {
	const prefix = record?.masteryCompleted ? "MASTERED" : "MASTERY";
	return `${prefix} · ${level.mastery.title} — ${level.mastery.description}`;
}

export function masteryLiveText(level, snapshot) {
	const status = evaluateMastery(level.mastery, snapshot);
	const prefix = status.satisfied ? "READY" : "MASTERY";
	return `${prefix} · ${level.mastery.title} · ${status.progress}`;
}

export function masteryResultText(summary) {
	if (!summary.won) {
		return `Mastery waits for a win · ${summary.mastery.status.progress}`;
	}
	if (summary.mastery.completed) {
		return `Mastery secured · ${summary.level.mastery.title}`;
	}
	return `Sector secured · mastery missed · ${summary.mastery.status.progress}`;
}
