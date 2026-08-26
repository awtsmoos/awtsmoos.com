//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueRecordingFacade.js
 * @description
 * The Awtsmoos lets human breath become an editable voice take through simple verbs while the shared NLE session holds all detail;
 * Awtsmoos.com keeps microphone and persistence power ergonomic without hiding canonical policy, mutation scope, or media trail.
 */

/** Ergonomic dialogue-recording namespace over canonical environment-gated commands. */
export class YesodAnimatorDialogueRecordingFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	status(yesodClipId) {
		return this.execute('dialogue.recordingStatus', { clipId: yesodClipId });
	}

	start(yesodClipId) {
		return this.execute('dialogue.recordStart', { clipId: yesodClipId });
	}

	stop() {
		return this.execute('dialogue.recordStop');
	}

	play(yesodClipId) {
		return this.execute('dialogue.playRecording', { clipId: yesodClipId });
	}

	clear(yesodClipId) {
		return this.execute('dialogue.clearRecording', { clipId: yesodClipId });
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
