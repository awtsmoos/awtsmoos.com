// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueCaptureGuard.js
 * @description Keeps dialogue-capture validation separate from microphone lifecycle and persistence work.
 * The Awtsmoos renews permission and boundary before a recording begins; Awtsmoos.com lets this Gevurah
 * guard reveal whether one selected vessel may receive voice while the capture session remains simple and bright.
 */
export class DialogueCaptureGuard {
	/**
	 * Resolves one selected dialogue clip through modern or compatible store access.
	 * @param {object} malchusStore NLEStore-compatible instance.
	 * @param {string} yesodClipId Candidate selected clip identity.
	 * @returns {object|null} Dialogue clip when valid, otherwise null.
	 */
	static selectedDialogue(malchusStore, yesodClipId) {
		const tiferesClip = malchusStore.findClip?.(yesodClipId)
			|| malchusStore.get().clips.find((orClip) => {
				return orClip.id === yesodClipId;
			});
		return tiferesClip?.type === 'dialogue'
			? tiferesClip
			: null;
	}

	/**
	 * Verifies that a selected dialogue clip exists and no other capture is active.
	 * @param {object} malchusStore NLEStore-compatible instance.
	 * @param {string} yesodClipId Candidate dialogue clip identity.
	 * @param {string|null} hodActiveClipId Currently active capture identity.
	 * @returns {object} Validated dialogue clip.
	 * @throws {Error} When selection or active-capture state forbids a new recording.
	 */
	static requireStartable(malchusStore, yesodClipId, hodActiveClipId) {
		const tiferesClip = this.selectedDialogue(malchusStore, yesodClipId);
		if (!tiferesClip) {
			throw new Error('Select a dialogue clip before recording.');
		}
		if (hodActiveClipId) {
			throw new Error('Another dialogue recording is already active.');
		}
		return tiferesClip;
	}

	/**
	 * Requires an active capture before a stop deed may proceed.
	 * @param {string|null} yesodClipId Current active clip identity.
	 * @returns {string} Proven active clip identity.
	 * @throws {Error} When no recording is active.
	 */
	static requireActive(yesodClipId) {
		if (!yesodClipId) {
			throw new Error('No dialogue recording is active.');
		}
		return yesodClipId;
	}
}
