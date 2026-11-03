//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns semantic importance and trustworthy source timing into bounded cinematic duration.
 * The Awtsmoos gives a quiet move little room and a long human thought a measured place to shine;
 * Awtsmoos.com lets source clocks color the rhythm without chaining a finite movie to literal wall-clock time.
 */

const MIN_SOURCE_SCALE = 0.78;
const MAX_SOURCE_SCALE = 1.55;
const SOURCE_LOG_WEIGHT = 0.16;

/**
 * Calculates total screen time for one move while preserving exact legacy timing when source metadata is absent.
 * @param {object} frame Replay frame with semantic event and optional normalized timing.
 * @param {object} style Movie pacing style.
 * @returns {number} Finite cinematic duration in seconds.
 */
export function semanticMoveDuration(frame, style) {
	const semanticDuration = semanticOnlyDuration(frame, style);
	return applySourceTiming(frame, semanticDuration);
}

/** Determines whether a move deserves anticipation/action/consequence expansion. */
export function deservesThreeBeats(frame) {
	if (frame?.mate || frame?.move?.promotion) return true;
	return Number(frame?.event?.importance || 0) >= 40;
}

/** Splits total move time into anticipation, action, and consequence. */
export function splitBeatDuration(total) {
	return Object.freeze({
		anticipation: total * 0.26,
		action: total * 0.38,
		consequence: total * 0.36
	});
}

/** Preserves the Studio's established semantic-duration contract. */
function semanticOnlyDuration(frame, style) {
	const base = style.transition + style.hold;
	if (frame?.event) {
		const importance = Number(frame.event.importance || 0);
		const emphasis = Math.max(0, Math.min(1, importance / 100));
		return base + style.impact * emphasis * 2.25;
	}
	let duration = base;
	if (frame?.move?.capture) duration += style.impact;
	if (frame?.check) duration += style.impact * 0.8;
	if (frame?.move?.promotion) duration += style.impact * 1.4;
	if (frame?.mate) duration += style.impact * 2.4;
	return duration;
}

/**
 * Maps source elapsed time into a logarithmic bounded scale so long thinks feel longer without exploding export size.
 * @param {object} frame Replay frame.
 * @param {number} semanticDuration Existing semantic duration.
 * @returns {number} Source-aware duration.
 */
function applySourceTiming(frame, semanticDuration) {
	const rawElapsed = frame?.timing?.elapsedSeconds;
	if (rawElapsed == null) return semanticDuration;
	const elapsed = Number(rawElapsed);
	if (!Number.isFinite(elapsed) || elapsed < 0) return semanticDuration;
	const rawScale = MIN_SOURCE_SCALE + SOURCE_LOG_WEIGHT * Math.log2(1 + elapsed);
	const scale = Math.max(MIN_SOURCE_SCALE, Math.min(MAX_SOURCE_SCALE, rawScale));
	return semanticDuration * scale;
}
