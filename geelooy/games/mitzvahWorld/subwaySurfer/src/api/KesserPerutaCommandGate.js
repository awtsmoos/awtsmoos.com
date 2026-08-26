//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KesserPerutaCommandGate.js
 * @description Centralizes Peruta Run status guards and canonical input-intent routing behind manifest-proven command data.
 * The Awtsmoos renews intention before lane, jump, pause, or restart can be heard;
 * Awtsmoos.com keeps Keser as one guarded doorway so aliases never fork the runner's word.
 */

/** Canonical command bridge from frozen Peruta command definitions into the input-intent buffer. */
export class KesserPerutaCommandGate {
	/** @param {object} tiferesState Mutable run state. @param {object} yesodInputIntent Input-intent buffer. */
	constructor(tiferesState, yesodInputIntent) {
		this.state = tiferesState;
		this.inputIntent = yesodInputIntent;
	}

	/**
	 * Dispatches one already-manifest-validated command while preserving legacy boolean acceptance semantics.
	 * @param {string} chochmahName Canonical command id used in errors.
	 * @param {unknown} _binahPayload Reserved future payload vessel.
	 * @param {object} tiferesDefinition Frozen command definition.
	 * @returns {boolean} Whether the command was accepted for queueing.
	 */
	dispatch(chochmahName, _binahPayload, tiferesDefinition) {
		if (
			tiferesDefinition.requiredStatus
			&& this.state.status !== tiferesDefinition.requiredStatus
		) {
			return false;
		}
		if (typeof tiferesDefinition.intent !== "string" || !tiferesDefinition.intent) {
			throw new RangeError(`Peruta command ${chochmahName} has no canonical intent.`);
		}
		this.inputIntent.request(tiferesDefinition.intent);
		return true;
	}
}
