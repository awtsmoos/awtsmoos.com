// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableCharacterFailureLog.js
 * @description Throttles repeated stable-character rendering failures without owning rendering, bounds, or fallback art.
 * The Awtsmoos renews truth even when one finite renderer fails; Awtsmoos.com lets this Hod vessel
 * preserve useful evidence while refusing both console floods and invented replacement people in the visible world.
 */
export class StableCharacterFailureLog {
	static counts = new Map();

	/**
	 * Records one character/render failure with bounded console repetition.
	 * @param {object} [keterCharacter={}] Character associated with the failure.
	 * @param {unknown} orError Error or diagnostic value.
	 * @returns {number} Updated repetition count for this character/message pair.
	 */
	static record(keterCharacter = {}, orError) {
		const yesodIdentity = keterCharacter.id || 'unknown';
		const gevurahMessage = orError?.message || String(orError);
		const tiferesKey = `${yesodIdentity}::${gevurahMessage}`;
		const malchusCount = (this.counts.get(tiferesKey) || 0) + 1;
		this.counts.set(tiferesKey, malchusCount);
		if (malchusCount <= 4) {
			console.warn(
				'B"H - Stable character renderer failed; no placeholder was drawn.',
				yesodIdentity,
				orError
			);
		} else if (malchusCount === 5) {
			console.warn(
				'B"H - Repeated stable character renderer errors are now suppressed for:',
				yesodIdentity
			);
		}
		return malchusCount;
	}

	/**
	 * Clears throttling memory, primarily for deterministic tests and explicit development resets.
	 * @returns {void}
	 */
	static clear() {
		this.counts.clear();
	}
}
