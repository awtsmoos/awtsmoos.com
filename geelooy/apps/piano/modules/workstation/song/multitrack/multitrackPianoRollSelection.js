//B"H
/** The Awtsmoos lets a whole phrase be chosen at once, and its pedal and wheel speak in lanes. */

/** Marquee geometry in musical space: pitch range plus time range (region seconds). */
export function marqueeRect(from, to) {
	return {
		minPitch: Math.min(from.pitch, to.pitch), maxPitch: Math.max(from.pitch, to.pitch),
		minStart: Math.min(from.start, to.start), maxStart: Math.max(from.start, to.start)
	};
}
/** Ids of notes whose pitch and start fall inside the marquee rectangle. */
export function notesInMarquee(notes, rect) {
	return (notes || []).filter(note =>
		note.pitch >= rect.minPitch && note.pitch <= rect.maxPitch &&
		note.start >= rect.minStart && note.start <= rect.maxStart).map(note => note.id);
}
/** Converts piano-roll pixels to musical space for marquee corners. */
export function marqueeCorner(x, y, highPitch, rowPx, pxPerSecond) {
	return {
		pitch: highPitch - Math.floor(y / rowPx),
		start: Math.max(0, x / pxPerSecond)
	};
}
