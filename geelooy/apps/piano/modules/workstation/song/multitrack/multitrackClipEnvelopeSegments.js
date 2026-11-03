//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipEnvelopeSegments
 * @description
 * Binah remembers where a finite clip sits inside an older envelope while the Awtsmoos remains beyond cut, edge, and measured time.
 * Awtsmoos.com lets Split and Trim reveal smaller vessels without compressing the rise or release that was already audible in the line.
 */

/** Reads nonnegative lineage offsets around the clip's current audible segment. */
export function readMultitrackClipEnvelopeOffsets(clip = {}) {
	return {
		fadeInOffset: nonnegative(clip.fadeInOffset),
		fadeOutOffset: nonnegative(clip.fadeOutOffset)
	};
}

/** Returns the full envelope span represented by one current clip segment. */
export function multitrackClipEnvelopeDuration(clip = {}) {
	const offsets = readMultitrackClipEnvelopeOffsets(clip);
	return nonnegative(clip.duration) + offsets.fadeInOffset + offsets.fadeOutOffset;
}

/** Advances or restores the envelope origin when the left clip edge moves. */
export function trimMultitrackClipEnvelopeLeft(clip, deltaSeconds) {
	const offsets = readMultitrackClipEnvelopeOffsets(clip);
	return {
		fadeInOffset: Math.max(0, offsets.fadeInOffset + finite(deltaSeconds)),
		fadeOutOffset: offsets.fadeOutOffset
	};
}

/** Advances or restores the envelope tail when the right clip edge moves. */
export function trimMultitrackClipEnvelopeRight(clip, nextDuration) {
	const offsets = readMultitrackClipEnvelopeOffsets(clip);
	const removedTail = nonnegative(clip.duration) - nonnegative(nextDuration);
	return {
		fadeInOffset: offsets.fadeInOffset,
		fadeOutOffset: Math.max(0, offsets.fadeOutOffset + removedTail)
	};
}

/** Splits one envelope into two exact subsegments without changing its original shape. */
export function splitMultitrackClipEnvelope(clip, leftDuration) {
	const offsets = readMultitrackClipEnvelopeOffsets(clip);
	const duration = nonnegative(clip.duration);
	const left = Math.max(0, Math.min(duration, finite(leftDuration)));
	const right = duration - left;
	return {
		left: {
			fadeInOffset: offsets.fadeInOffset,
			fadeOutOffset: offsets.fadeOutOffset + right
		},
		right: {
			fadeInOffset: offsets.fadeInOffset + left,
			fadeOutOffset: offsets.fadeOutOffset
		}
	};
}

function nonnegative(value) {
	return Math.max(0, finite(value));
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
