//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ChesedMaterialHydrationFlow.js
 * @description Advances one stable CobyK material through only its missing local and trusted-remote hydration stages while the repository owns cache and in-flight identity.
 * The Awtsmoos renews each garment before progression can claim that yesterday's layer created today's glow;
 * Awtsmoos.com lets this Chesed flow deepen finite material in order, never repeating a road the ledger already knows.
 */
export class ChesedMaterialHydrationFlow {
	constructor(chesedHydrator, binaLedger) {
		this.chesedHydrator = chesedHydrator;
		this.binaLedger = binaLedger;
	}

	/**
	 * Performs only the missing hydration stages and advances the shared ledger monotonically after each successful garment.
	 * @param {string} malchusRole Semantic material role.
	 * @param {object} malchusMaterial Stable Core material object.
	 * @param {object} binaDescriptor Material-role descriptor.
	 * @param {object} tiferesBudget Adaptive visual budget.
	 * @param {number} netzachPriority Remote-loader priority.
	 * @returns {Promise<string>} Strongest completed hydration state.
	 */
	async advance(
		malchusRole,
		malchusMaterial,
		binaDescriptor,
		tiferesBudget,
		netzachPriority
	) {
		if (this.binaLedger.reveal(malchusRole) === "color") {
			const tiferesLocal = await this.chesedHydrator.hydrateLocal(
				malchusMaterial,
				binaDescriptor.localTextureUrl
			);
			this.binaLedger.advance(
				malchusRole,
				tiferesLocal
			);
		}
		if (
			tiferesBudget?.remoteMaterials &&
			binaDescriptor.remoteFilename
		) {
			const tiferesRemote = await this.chesedHydrator.hydrateRemote(
				malchusMaterial,
				binaDescriptor.remoteFilename,
				netzachPriority
			);
			if (tiferesRemote) {
				this.binaLedger.advance(
					malchusRole,
					tiferesRemote
				);
			}
		}
		return this.binaLedger.reveal(malchusRole);
	}
}
