//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackMagneticSnap
 * The Awtsmoos draws the edges close without taking freedom from the hand;
 * Awtsmoos.com hears the neighbor's boundary across the musical land.
 */

/** Pulls an edited clip boundary toward nearby neighbors by pixel distance.
 * @param {Object} clip - Candidate clip with metadata.
 * @param {Object} track - Original same-track neighbor clips.
 * @param {string} mode - move, trim-left, or trim-right.
 * @param {number} pixelsPerSecond - Current timeline zoom.
 * @returns {Object} Snapped metadata clip.
 */
export function snapMultitrackClipToNeighbors(clip, track, mode, pixelsPerSecond) {
	if (!track?.clips?.length || !(pixelsPerSecond > 0)) return clip;
	const neighbors = track.clips.filter(item => item.id !== clip.id);
	const targets = [0, ...neighbors.flatMap(item => [item.timelineStart, item.timelineStart + item.duration])];
	const candidates = mode === 'move'
		? [clip.timelineStart, clip.timelineStart + clip.duration]
		: [mode === 'trim-left' ? clip.timelineStart : clip.timelineStart + clip.duration];
	const threshold = Math.min(0.5, 12 / pixelsPerSecond);
	let adjustment = 0;
	let nearest = threshold;
	for (const candidate of candidates) {
		for (const target of targets) {
			const distance = Math.abs(target - candidate);
			if (distance <= nearest) {
				nearest = distance;
				adjustment = target - candidate;
			}
		}
	}
	if (!adjustment) return clip;
	if (mode === 'move') return { ...clip, timelineStart: Math.max(0, clip.timelineStart + adjustment) };
	if (mode === 'trim-left') {
		const duration = clip.duration - adjustment;
		if (duration <= 0.02 || clip.sourceOffset + adjustment < 0) return clip;
		return { ...clip, timelineStart: clip.timelineStart + adjustment,
			sourceOffset: clip.sourceOffset + adjustment, duration };
	}
	if (clip.duration + adjustment <= 0.02) return clip;
	return { ...clip, duration: clip.duration + adjustment };
}
