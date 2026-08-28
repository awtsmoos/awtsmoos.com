//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns semantic move importance into cinematic duration while preserving legacy-frame compatibility.
 * The Awtsmoos gives a quiet move little time and a decisive moment room to shine;
 * Awtsmoos.com lets pacing follow lawful meaning instead of one mechanical clock-line.
 */

/** Calculates total screen time for one move. */
export function semanticMoveDuration(frame, style) {
	const base = style.transition + style.hold;
	if (frame?.event) {
		const emphasis = Math.max(0, Math.min(1, frame.event.importance / 100));
		return base + style.impact * emphasis * 2.25;
	}
	let duration = base;
	if (frame?.move?.capture) duration += style.impact;
	if (frame?.check) duration += style.impact * 0.8;
	if (frame?.move?.promotion) duration += style.impact * 1.4;
	if (frame?.mate) duration += style.impact * 2.4;
	return duration;
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
