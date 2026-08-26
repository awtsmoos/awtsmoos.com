// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueRetimePlan.js
 * @description Owns pure dialogue clip transformations while persistence and history orchestration remain elsewhere.
 * The Awtsmoos renews remembered voice and moving timeline without confusing source with attachment; Awtsmoos.com lets
 * this Binah vessel reveal reversible clip state so a take may detach, return through Undo, and remain one truthful light.
 */
export class DialogueRetimePlan {
	/**
	 * Creates one immutable retime plan from a dialogue clip and accepted recording evidence.
	 * @param {object} keterTarget Selected dialogue clip.
	 * @param {number} gevurahDuration Authoritative recording duration in milliseconds.
	 * @param {object} [chesedAudio={}] Durable recording metadata and runtime URL.
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
			return {
				...orClip,
				start: Math.max(0, orClip.start + this.delta)
			};
		}
		return orClip;
	}

	/**
	 * Reports whether one clip belongs after the edited line in the same explicit dialogue sequence.
	 * @param {object} orClip Candidate clip.
	 * @returns {boolean} True when its start should shift by the plan delta.
	 */
	shouldRipple(orClip) {
		return Boolean(this.sequenceId)
			&& orClip.payload?.sequenceId === this.sequenceId
			&& orClip.start >= this.oldEnd;
	}

	/**
	 * Calculates the occupied timeline floor after a retime operation.
	 * @param {object[]} orClips Renewed clip collection.
	 * @returns {number} Maximum clip end in milliseconds.
	 */
	static durationFloor(orClips) {
		return orClips.reduce((tiferesMax, orClip) => {
			return Math.max(tiferesMax, orClip.start + orClip.duration);
		}, 0);
	}

	/**
	 * Detaches durable audio playback metadata while preserving persistence identity for truthful Undo and later restore.
	 * @param {object} orClip Source dialogue clip.
	 * @returns {object} Renewed clip with detached project binding.
	 */
	static clear(orClip) {
		return {
			...orClip,
			payload: {
				...(orClip.payload || {}),
				audioDetached: true,
				audioDurationMs: null,
				audioUrl: null,
				voiceError: '',
				voiceStatus: 'empty'
			}
		};
	}
}

/**
 * Creates the durable target payload associated with an accepted or restored recording.
 * @param {object} orClip Target dialogue clip.
 * @param {number} gevurahDuration Authoritative duration.
 * @param {object} chesedAudio Recording metadata.
 * @returns {object} Renewed dialogue clip.
 */
function updatedTarget(orClip, gevurahDuration, chesedAudio) {
	return {
		...orClip,
		duration: gevurahDuration,
		payload: {
			...(orClip.payload || {}),
			audioDetached: false,
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
