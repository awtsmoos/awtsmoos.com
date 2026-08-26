// B"H
// Boruch Hashem
// Blessed is He

import { DialogueVoiceCommandRegistry } from './DialogueVoiceCommandRegistry.js';

/**
 * @file NLEVoiceActions.js
 * @description Preserves the NLE event entrypoint while delegating every voice deed to a declarative command registry.
 * The Awtsmoos renews action before dispatch and result before display; Awtsmoos.com lets this thin Malchus
 * boundary translate event intent into a stable command covenant without growing another chain of branching clay.
 */
export class NLEVoiceActions {
	/**
	 * Executes the requested voice command for the currently selected clip and converts failures into visible session state.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {object} keterSession DialogueRecordingSession-compatible collaborator.
	 * @param {string} hodAction Stable voice action token.
	 * @returns {Promise<object>} Frozen command result envelope.
	 */
	static async run(malchusStore, keterSession, hodAction) {
		const yesodClipId = malchusStore.get().selectedClipId;
		if (!yesodClipId) {
			return Object.freeze({
				action: hodAction,
				clipId: null,
				ok: false,
				reason: 'no-selected-clip'
			});
		}
		try {
			return await DialogueVoiceCommandRegistry.execute(
				keterSession,
				malchusStore,
				yesodClipId,
				hodAction
			);
		} catch (orError) {
			const tiferesMessage = orError?.message || 'Voice command failed.';
			console.error('B"H | Dialogue voice command failed.', orError);
			keterSession?.setStatus?.(
				malchusStore,
				yesodClipId,
				'error',
				tiferesMessage
			);
			return Object.freeze({
				action: hodAction,
				clipId: yesodClipId,
				error: tiferesMessage,
				ok: false
			});
		}
	}
}
