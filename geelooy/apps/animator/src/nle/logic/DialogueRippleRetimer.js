// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRetimePlan } from './DialogueRetimePlan.js';

/**
 * @file DialogueRippleRetimer.js
 * @description Commits accepted voice timing through explicit user-history or restore-synchronization policy.
 * The Awtsmoos renews voice and timeline while remembered project load differs from a new creative deed;
 * Awtsmoos.com lets this Gevurah gate distinguish them so Undo records authorship, not the mere reopening of light.
 */
export class DialogueRippleRetimer {
	/**
	 * Fits one recording to its dialogue clip and ripples later same-sequence clips.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @param {number} gevurahDurationMs Authoritative decoded recording duration.
	 * @param {object} [chesedAudio={}] Recording metadata and runtime URL.
	 * @param {object} [tiferesOptions={}] Set `{history:false}` during persistence restore.
	 * @returns {object|null} Immutable retime evidence or null when the clip is unavailable.
	 */
	static apply(
		malchusStore,
		yesodClipId,
		gevurahDurationMs,
		chesedAudio = {},
		tiferesOptions = {}
	) {
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
		const binahPlan = new DialogueRetimePlan(
			tiferesTarget,
			hodDuration,
			chesedAudio
		);
		const orClips = keterState.clips.map((orClip) => {
			return binahPlan.apply(orClip);
		});
		const netzachDurationFloor = DialogueRetimePlan.durationFloor(orClips);
		this.commit(malchusStore, {
			clips: orClips,
			duration: Math.max(keterState.duration, netzachDurationFloor)
		}, tiferesOptions);
		return Object.freeze({
			clipId: yesodClipId,
			delta: binahPlan.delta,
			duration: hodDuration,
			durationFloor: netzachDurationFloor
		});
	}

	/**
	 * Detaches one take from project playback through user-edit history while preserving persisted source data.
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

	/**
	 * Commits project synchronization either through durable history or transient restore synchronization.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {object} chesedPatch Project-state patch.
	 * @param {object} tiferesOptions Commit policy.
	 * @returns {void}
	 */
	static commit(malchusStore, chesedPatch, tiferesOptions) {
		if (tiferesOptions.history === false) {
			malchusStore.set(chesedPatch);
			return;
		}
		malchusStore.transact(chesedPatch);
	}
}
