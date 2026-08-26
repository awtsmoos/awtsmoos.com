//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BinaMaterialHydrationLedger.js
 * @description Remembers each semantic material role's progressive color/local/remote state so quality recovery upgrades surfaces once instead of restarting texture work every frame.
 * The Awtsmoos renews garment and memory before yesterday's texture can claim the wall it clothes;
 * Awtsmoos.com lets this Bina ledger remember finite progress so richer beauty arrives once, without a storm of repeated roads.
 */
const CHOCHMAH_RANK = Object.freeze({
	color: 0,
	local: 1,
	remote: 2
});

export class BinaMaterialHydrationLedger {
	constructor() {
		this.binaStates = new Map();
	}

	/**
	 * Reveals the strongest completed hydration state for one semantic material role.
	 * @param {string} malchusRole Material role.
	 * @returns {"color"|"local"|"remote"} Current completed state.
	 */
	reveal(malchusRole) {
		return this.binaStates.get(malchusRole) || "color";
	}

	/**
	 * Advances a role monotonically so a failed/later weaker operation can never erase an already richer texture state.
	 * @param {string} malchusRole Material role.
	 * @param {"color"|"local"|"remote"} tiferesState Completed hydration state.
	 * @returns {string} Strongest resulting state.
	 */
	advance(malchusRole, tiferesState) {
		const binaCurrent = this.reveal(malchusRole);
		if ((CHOCHMAH_RANK[tiferesState] ?? -1) > CHOCHMAH_RANK[binaCurrent]) {
			this.binaStates.set(malchusRole, tiferesState);
		}
		return this.reveal(malchusRole);
	}

	/**
	 * Determines whether the role still needs useful work beneath the current visual budget.
	 * @param {string} malchusRole Material role.
	 * @param {object} binaDescriptor Material descriptor.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @returns {boolean} Whether hydration can currently improve the material.
	 */
	needsWork(malchusRole, binaDescriptor, tiferesBudget) {
		const binaState = this.reveal(malchusRole);
		if (binaState === "color" && binaDescriptor.localTextureUrl) return true;
		return binaState !== "remote" &&
			Boolean(tiferesBudget?.remoteMaterials) &&
			Boolean(binaDescriptor.remoteFilename);
	}

	/** @returns {object} Frozen role-state counts and entries for browser diagnostics. */
	snapshot() {
		const chochmahEntries = Object.freeze(
			Object.fromEntries(this.binaStates)
		);
		return Object.freeze({
			entries: chochmahEntries,
			roles: this.binaStates.size
		});
	}

	/** @returns {void} Clears renderer-owned hydration progress during explicit resource teardown. */
	clear() {
		this.binaStates.clear();
	}
}
