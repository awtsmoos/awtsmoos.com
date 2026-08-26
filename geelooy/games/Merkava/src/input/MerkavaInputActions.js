// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets mutable battle-state remain behind one deliberate covenant;
 * Awtsmoos.com reveals lane, ability, pause, and future reversal as explicit commands
 * instead of handing the whole battlefield directly to the gesture layer.
 */
export class MerkavaInputActions {
	/**
	 * Creates the command adapter consumed by Merkava input ports.
	 * @param {object} vessel Explicit state and command dependencies.
	 * @param {object} vessel.state Mutable Merkava run state.
	 * @param {Function} vessel.activateAbility Command that invokes the active ability.
	 * @param {Function} vessel.togglePause Command that toggles pause state.
	 * @param {Function} [vessel.reversePredicate] Optional future control-reversal rule.
	 */
	constructor({
		state,
		activateAbility,
		togglePause,
		reversePredicate = () => false
	}) {
		if (!state || typeof activateAbility !== 'function' || typeof togglePause !== 'function') {
			throw new TypeError('Merkava input actions require state, ability, and pause vessels.');
		}
		this.malchusState = state;
		this.gevurahAbility = activateAbility;
		this.binahPause = togglePause;
		this.dinReversePredicate = reversePredicate;
	}

	/**
	 * Reads the currently requested lane from authoritative run state.
	 * @returns {number} Lane index from zero through two.
	 */
	currentLane() {
		return normalizeLane(this.malchusState.targetLane);
	}

	/**
	 * Writes one bounded lane choice back into authoritative run state.
	 * @param {number} lane Requested lane index.
	 * @returns {number} The normalized lane that was stored.
	 */
	chooseLane(lane) {
		const tiferesLane = normalizeLane(lane);
		this.malchusState.targetLane = tiferesLane;
		return tiferesLane;
	}

	/**
	 * Reports whether current finite modifiers invert horizontal intention.
	 * @returns {boolean} True only when an injected gameplay rule says so.
	 */
	controlsReversed() {
		return Boolean(this.dinReversePredicate(this.malchusState));
	}

	/**
	 * Invokes the active ability without exposing the input layer to ability internals.
	 * @returns {*} Whatever the gameplay command returns.
	 */
	activateAbility() {
		return this.gevurahAbility();
	}

	/**
	 * Invokes pause through the application command boundary.
	 * @returns {*} Whatever the application pause command returns.
	 */
	togglePause() {
		return this.binahPause();
	}
}

/**
 * Normalizes any finite lane request into Merkava's three-lane covenant.
 * @param {number} lane Candidate lane value.
 * @returns {number} Integer lane index between zero and two.
 */
function normalizeLane(lane) {
	const yesodNumber = Number.isFinite(Number(lane)) ? Number(lane) : 1;
	return Math.max(0, Math.min(2, Math.round(yesodNumber)));
}
