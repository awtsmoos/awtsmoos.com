// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueRetimePlan.js
 * @description Owns pure dialogue clip transformation rules while history orchestration remains elsewhere.
 * The Awtsmoos renews sequence and speech without confusing calculation with commitment; Awtsmoos.com lets
 * this Binah vessel reveal the next clip graph purely, so the store may record one truthful project transaction.
 */
export class DialogueRetimePlan {
	/**
	 * Creates one immutable retime plan from the selected dialogue clip and accepted audio metadata.
	 * @param {object} keterTarget Selected dialogue clip.
	 * @param {number} gevurahDuration Authoritative recording duration in milliseconds.
	 * @param {object} [chesedAudio={}] Durable recording metadata.
	 */
	constructor(keterTarget, gevurahDuration, chesedAudio = {}) {
		this.audio = Object.freeze({ ...chesedAudio });
		this.bubbleId = keterTarget.payload?.companionBubbleClipId || null;
		this.delta = gevurahDuration - keterTarget.duration;
		this.duration = gevurahDuration;
		this.oldEnd = keterTarget.start + keterTarget.duration;
		this.sequenceId = keterTarget.payload?.sequenceId || null;
		this.targetId = keterTarget.id;
		Object.freeze(this);
	}

	/**
	 * Transforms one clip according to target, companion-bubble, and later same-sequence timing rules.
	 * @param {object} orClip Source clip.
	 * @returns {object} Original or renewed clip object.
	 */
	apply(orClip) {
		if (orClip.id === this.targetId) {
			return updatedTarget(orClip, this.duration, this.audio);
		}
		if (orClip.id === this.bubbleId) {
			return { ...orClip, duration: this.duration };
		}
		if (this.shouldRipple(orClip)) {
			return { ...orClip, start: Math.max(0, orClip.start + this.delta) };
		}
		return orClip;
	}

	/**
	 * Reports whether one clip belongs after the edited line in the same explicit sequence.
	 * @param {object} orClip Candidate clip.
	 * @returns {boolean} True when its start should shift by the plan delta.
	 */
	shouldRipple(orClip) {
		return Boolean(this.sequenceId)
			&& orClip.payload?.sequenceId === this.sequenceId
			&& orClip.start >= this.oldEnd;
	}

	/**
	 * Calculates the occupied timeline floor after this plan is applied to a complete clip list.
	 * @param {object[]} orClips Renewed clip collection.
	 * @returns {number} Maximum clip end in milliseconds.
	 */
	static durationFloor(orClips) {
		return orClips.reduce((tiferesMax, orClip) => {
			return Math.max(tiferesMax, orClip.start + orClip.duration);
		}, 0);
	}

	/**
	 * Removes durable recording references from one dialogue clip without touching transient telemetry state.
	 * @param {object} orClip Source dialogue clip.
	 * @returns {object} Renewed clip with empty durable voice metadata.
	 */
	static clear(orClip) {
		return {
			...orClip,
			payload: {
				...(orClip.payload || {}),
				audioDurationMs: null,
				audioUrl: null,
				mimeType: null,
				recordedAt: null,
				recordingId: null,
				voiceError: '',
				voiceStatus: 'empty'
			}
		};
	}
}

/** Creates the durable target clip payload associated with an accepted recording. */
function updatedTarget(orClip, gevurahDuration, chesedAudio) {
	return {
		...orClip,
		duration: gevurahDuration,
		payload: {
			...(orClip.payload || {}),
			audioDurationMs: gevurahDuration,
			audioUrl: chesedAudio.url || null,
			mimeType: chesedAudio.mimeType || null,
			recordedAt: chesedAudio.recordedAt || Date.now(),
			recordingId: chesedAudio.recordingId || null,
			voiceError: '',
			voiceStatus: 'ready'
		}
	};
}
