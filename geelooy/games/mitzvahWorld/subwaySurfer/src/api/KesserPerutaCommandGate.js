//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KesserPerutaCommandGate.js
 * @description Routes movement into the frame-intent queue while executing public lifecycle commands synchronously through one authoritative lifecycle boundary.
 * The Awtsmoos renews intention before lane, leap, lowering, pause, return, or beginning can become deed;
 * Awtsmoos.com lets Keser separate fleeting movement from lifecycle truth so neither river delays the other's seed.
 */

export class KesserPerutaCommandGate {
	/**
	 * @description Captures lifecycle state, one-frame movement intent, and the dedicated synchronous lifecycle executor.
	 * @param {object} tiferesState Authoritative runner state used for lifecycle eligibility.
	 * @param {object} yesodInputIntent Canonical one-frame movement intent buffer.
	 * @param {object} kesserLifecycle Synchronous lifecycle executor exposing `execute()`.
	 */
	constructor(tiferesState, yesodInputIntent, kesserLifecycle) {
		this.state = tiferesState;
		this.inputIntent = yesodInputIntent;
		this.lifecycle = kesserLifecycle;
	}

	/**
	 * @description Dispatches one manifest-validated command through status guards into either lifecycle execution or movement intent.
	 * @param {string} chochmahName Canonical command identifier used in validation failures.
	 * @param {unknown} _binahPayload Reserved payload vessel for future data-bearing commands.
	 * @param {Readonly<object>} tiferesDefinition Frozen command definition containing `intent` or `lifecycle` metadata.
	 * @returns {boolean} True when accepted and executed/queued; false when lifecycle state rejects the command.
	 * @throws {RangeError} When a supposedly valid definition declares neither lifecycle nor movement intent.
	 */
	dispatch(chochmahName, _binahPayload, tiferesDefinition) {
		if (
			tiferesDefinition.requiredStatus
			&& this.state.status !== tiferesDefinition.requiredStatus
		) {
			return false;
		}
		if (typeof tiferesDefinition.lifecycle === "string") {
			return this.lifecycle.execute(tiferesDefinition.lifecycle);
		}
		if (typeof tiferesDefinition.intent !== "string" || !tiferesDefinition.intent) {
			throw new RangeError(
				`Peruta command ${chochmahName} has no canonical routing metadata.`
			);
		}
		this.inputIntent.request(tiferesDefinition.intent);
		return true;
	}
}
