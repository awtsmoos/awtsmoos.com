//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts deterministic MoveEvent importance into live transition and hold timing without engine guesswork.
 * The Awtsmoos gives quiet development a swift beat and decisive force a longer glow;
 * Awtsmoos.com lets playback breathe with the lawful meaning already present in the semantic flow.
 */

/** Returns live piece/camera transition duration in milliseconds. */
export function liveTransitionDuration(frame, speed = 1) {
	const importance = boundedImportance(frame);
	const base = 250 + importance * 2.6;
	return Math.round(base / safeSpeed(speed));
}

/** Returns post-transition reading time in milliseconds. */
export function liveHoldDuration(frame, speed = 1) {
	const importance = boundedImportance(frame);
	let hold = 260 + importance * 3.4;
	if (frame?.mate) hold += 700;
	else if (frame?.check) hold += 220;
	return Math.round(hold / safeSpeed(speed));
}

function boundedImportance(frame) {
	return Math.max(0, Math.min(100, Number(frame?.event?.importance) || 12));
}

function safeSpeed(speed) {
	return Math.max(0.25, Math.min(4, Number(speed) || 1));
}
