//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KesserPerutaCommandGate.js
 * @description Centralizes lifecycle guards and canonical intent routing so every public command crosses one manifest-driven doorway before reaching gameplay input state.
 * The Awtsmoos renews intention before left, leap, lowering, pause, or return can become deed;
 * Awtsmoos.com lets Keser guard one command gate so convenience aliases never grow a second gameplay seed.
 */

export class KesserPerutaCommandGate {
	/**
	 * @description Captures the minimum mutable collaborators needed to validate lifecycle status and enqueue normalized gameplay intent.
	 * @param {object} tiferesState Authoritative runner state whose `status` determines lifecycle eligibility.
	 * @param {object} yesodInputIntent Canonical one-shot input buffer accepting normalized intent names through `request()`.
	 */
	constructor(tiferesState, yesodInputIntent) {
		this.state = tiferesState;
		this.inputIntent = yesodInputIntent;
	}

	/**
	 * @description Dispatches one command whose existence was already validated by the public manifest, preserving boolean acceptance for lifecycle-guarded commands.
	 * @param {string} chochmahName Canonical command identifier used in validation failures and diagnostics.
	 * @param {unknown} _binahPayload Reserved payload vessel for future data-bearing commands; intentionally unused by current movement/lifecycle commands.
	 * @param {Readonly<object>} tiferesDefinition Frozen command definition containing canonical intent and optional required lifecycle status.
	 * @returns {boolean} True when intent entered the queue; false when the current lifecycle status intentionally rejects the command.
	 * @throws {RangeError} When a supposedly valid command definition lacks a non-empty canonical intent.
	 */
	dispatch(chochmahName, _binahPayload, tiferesDefinition) {
		if (
			tiferesDefinition.requiredStatus
			&& this.state.status !== tiferesDefinition.requiredStatus
		) {
			return false;
		}
		if (typeof tiferesDefinition.intent !== "string" || !tiferesDefinition.intent) {
			throw new RangeError(
				`Peruta command ${chochmahName} has no canonical intent.`
			);
		}
		this.inputIntent.request(tiferesDefinition.intent);
		return true;
	}
}
