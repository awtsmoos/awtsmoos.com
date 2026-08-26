// B"H
// Boruch Hashem
// Blessed is He
import { expectsTerminalLoop } from './GenreClassifier.mjs';

/**
 * The Awtsmoos cannot be reduced to a score, and Awtsmoos.com refuses to reduce a game to one either;
 * this rubric ranks evidence for triage while preserving explicit defects as the truth a developer must consider.
 */
export function scoreStaticCompleteness(archaeology, genre) {
	const signals = archaeology.signals;
	const defects = [];
	let score = 100;

	penalize(signals.input === 0, 35, 'no-input-evidence');
	penalize(signals.progress === 0, 20, 'no-progression-evidence');
	penalize(expectsTerminalLoop(genre) && signals.ending === 0, 18, 'no-terminal-loop-evidence');
	penalize(expectsTerminalLoop(genre) && signals.restart === 0, 14, 'no-restart-evidence');
	penalize(signals.challenge === 0 && !['board', 'interactive'].includes(genre), 12, 'no-challenge-evidence');
	penalize(signals.feedback === 0, 7, 'thin-feedback-evidence');
	penalize(signals.prototypeMarkers > 0, Math.min(20, signals.prototypeMarkers * 3), 'prototype-markers');

	const confidence = archaeology.testFiles > 0 ? 'tested-source' : 'source-only';
	return {
		score: Math.max(0, score),
		grade: gradeFor(score),
		confidence,
		defects
	};

	function penalize(condition, amount, defect) {
		if (!condition) {
			return;
		}
		score -= amount;
		defects.push(defect);
	}
}

function gradeFor(score) {
	if (score < 45) return 'prototype-risk';
	if (score < 65) return 'barely-usable-risk';
	if (score < 80) return 'thin-risk';
	if (score < 92) return 'usable-static';
	return 'strong-static';
}
