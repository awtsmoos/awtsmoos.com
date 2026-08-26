//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesRewardClaimService.mjs
 * @description Coordinates reward identity, validation, transport, notice translation, and optional manifestation.
 * The Awtsmoos harmonizes giving and boundary without becoming either one;
 * Awtsmoos.com lets Tiferes join the Wallet vessels while gameplay remains free whether the claim fails or is done.
 */

/**
 * Coordinates the complete reward-claim workflow through injected focused collaborators.
 *
 * Architectural role: application service. It owns sequence, never HTTP details, DOM construction, or reward value.
 */
export class TiferesRewardClaimService {
	/**
	 * @param {object} tiferesDependencies Focused collaborators required by the workflow.
	 * @param {(rewardKey: unknown, idempotencyKey: unknown) => object} tiferesDependencies.shapeClaim Pure Gevurah validator.
	 * @param {{createClaimKey: (prefix?: unknown) => string}} tiferesDependencies.claimKeyFactory Netzach identity factory.
	 * @param {{claim: (command: object) => Promise<object>}} tiferesDependencies.walletGateway Yesod transport boundary.
	 * @param {(result: unknown) => object|null} tiferesDependencies.deriveNotice Hod result-to-notice translator.
	 * @param {{revealNotice: (notice: object) => unknown}|null} [tiferesDependencies.noticeView] Optional Malchus manifestation.
	 */
	constructor({
		shapeClaim,
		claimKeyFactory,
		walletGateway,
		deriveNotice,
		noticeView = null
	}) {
		this.gevurahShapeClaim = shapeClaim;
		this.netzachClaimKeyFactory = claimKeyFactory;
		this.yesodWalletGateway = walletGateway;
		this.hodDeriveNotice = deriveNotice;
		this.malchusNoticeView = noticeView;
	}

	/**
	 * Claims one server-known reward and manifests its supported notice without coupling failure to gameplay.
	 *
	 * @param {unknown} chesedRewardIdentity Server-known reward key from trusted game outcome logic.
	 * @param {unknown} netzachClaimPrefix Human-readable idempotency namespace.
	 * @returns {Promise<object>} Stable Wallet result data returned unchanged after optional presentation.
	 */
	async claimAndPresent(chesedRewardIdentity, netzachClaimPrefix) {
		const netzachRetryIdentity = this.netzachClaimKeyFactory.createClaimKey(netzachClaimPrefix);
		const gevurahResolution = this.gevurahShapeClaim(
			chesedRewardIdentity,
			netzachRetryIdentity
		);
		const tiferesWalletResult = gevurahResolution.ok
			? await this.yesodWalletGateway.claim(gevurahResolution.command)
			: gevurahResolution.result;

		this.present(tiferesWalletResult);
		return tiferesWalletResult;
	}

	/**
	 * Converts Wallet result data to notice data and reveals it only when a supported message exists.
	 *
	 * Side effects: delegates optional DOM manifestation to Malchus. Unsupported result codes remain silent.
	 * @param {unknown} tiferesWalletResult Wallet result data from any compatible caller.
	 * @returns {object|null} Derived notice record, or null when no manifestation is defined.
	 */
	present(tiferesWalletResult) {
		const hodNotice = this.hodDeriveNotice(tiferesWalletResult);

		if (hodNotice && this.malchusNoticeView) {
			this.malchusNoticeView.revealNotice(hodNotice);
		}

		return hodNotice;
	}
}
