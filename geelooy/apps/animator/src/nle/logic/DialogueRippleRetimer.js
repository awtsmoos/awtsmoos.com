// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRetimePlan } from './DialogueRetimePlan.js';

/**
 * @file DialogueRippleRetimer.js
 * @description Commits accepted voice timing through one undoable project transaction while pure clip math lives in DialogueRetimePlan.
 * The Awtsmoos renews voice and timeline together without confusing passing meter-light with lasting edit;
 * Awtsmoos.com lets this Gevurah vessel commit only durable project substance so Undo and Redo remain truthful and bright.
 */
export class DialogueRippleRetimer {
	/**
	 * Fits one accepted recording to its dialogue clip and ripples later clips in the same sequence atomically.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @param {number} gevurahDurationMs Authoritative decoded recording duration.
	 * @param {object} [chesedAudio={}] Durable recording metadata.
	 * @returns {object|null} Immutable retime evidence or null when the clip is unavailable.
	 */
	static apply(malchusStore, yesodClipId, gevurahDurationMs, chesedAudio = {}) {
		const keterState = malchusStore.get();
		const tiferesTarget = keterState.clips.find((orClip) => {
			return orClip.id === yesodClipId;
		});
		if (!tiferesTarget) {
			return null;
		}
		const hodDuration = Math.max(
			1,
			Math.round(Number(gevurahDurationMs) || 1)
		);
		const tiferesPlan = new DialogueRetimePlan(
			tiferesTarget,
			hodDuration,
			chesedAudio
		);
		const orClips = keterState.clips.map((orClip) => {
			return tiferesPlan.apply(orClip);
		});
		const binahDurationFloor = DialogueRetimePlan.durationFloor(orClips);
		malchusStore.transact({
			clips: orClips,
			duration: Math.max(keterState.duration, binahDurationFloor)
		});
		return Object.freeze({
			clipId: yesodClipId,
			delta: tiferesPlan.delta,
			duration: hodDuration,
			durationFloor: binahDurationFloor
		});
	}

	/**
	 * Clears durable recording references through project history while transient meter/waveform state stays separate.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @returns {boolean} True when a matching clip existed and was renewed.
	 */
	static clear(malchusStore, yesodClipId) {
		const keterState = malchusStore.get();
		const tiferesExists = keterState.clips.some((orClip) => {
			return orClip.id === yesodClipId;
		});
		if (!tiferesExists) {
			return false;
		}
		malchusStore.transact({
			clips: keterState.clips.map((orClip) => {
				return orClip.id === yesodClipId
					? DialogueRetimePlan.clear(orClip)
					: orClip;
			})
		});
		return true;
	}
}
