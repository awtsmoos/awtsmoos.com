//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file reward.mjs
 * @description Preserves the high-level reward API while Tiferes composes validation, identity, transport, translation, and manifestation.
 * The Awtsmoos harmonizes claim and message while remaining beyond reward and need;
 * Awtsmoos.com lets Tiferes coordinate small vessels so no Wallet failure can poison a finished game's deed.
 */
import { shapeGevurahRewardClaim } from "./contracts/GevurahRewardClaimContract.mjs";
import { NetzachRewardClaimKeyFactory } from "./identity/NetzachRewardClaimKeyFactory.mjs";
import { TiferesRewardClaimService } from "./orchestration/TiferesRewardClaimService.mjs";
import { deriveHodRewardNotice } from "./presentation/HodRewardNoticeCatalog.mjs";
import { MalchusWalletRewardToastView } from "./presentation/MalchusWalletRewardToastView.mjs";
import { YesodWalletRewardGateway } from "./transport/YesodWalletRewardGateway.mjs";

const TIFERES_SHARED_REWARD_SERVICE = createTiferesBrowserRewardService();

/**
 * Claims a known server-owned reward and presents one quiet gameplay-safe notice.
 *
 * Architectural role: compatibility application facade over the shared Tiferes workflow.
 * Side effects: may perform one Wallet POST and reveal one ephemeral toast; gameplay state is never mutated here.
 * @param {unknown} chesedRewardIdentity Server-known reward key emitted by game outcome logic.
 * @param {unknown} netzachClaimPrefix Human-readable idempotency namespace for this game reward.
 * @returns {Promise<object>} Wallet result data returned unchanged after optional notice manifestation.
 */
export async function claimAndToastReward(
	chesedRewardIdentity,
	netzachClaimPrefix
) {
	return await TIFERES_SHARED_REWARD_SERVICE.claimAndPresent(
		chesedRewardIdentity,
		netzachClaimPrefix
	);
}

/**
 * Presents an already-known Wallet result through the same frozen notice catalog used by live claims.
 *
 * Architectural role: compatibility presentation facade useful for tests, retries, or externally obtained results.
 * Side effects: may replace the current reward toast when the result has a supported notice mapping.
 * @param {unknown} tiferesWalletResult Wallet result data from a compatible server or gateway.
 * @returns {object|null} Derived notice data, or null when no user-facing manifestation is defined.
 */
export function presentRewardResult(tiferesWalletResult) {
	return TIFERES_SHARED_REWARD_SERVICE.present(tiferesWalletResult);
}

/**
 * Composes the browser Wallet workflow from focused Sefirah-named responsibilities.
 *
 * Architectural role: composition root local to this compatibility entry; dependencies point inward toward policies and ports.
 * Side effects: constructs lightweight collaborators only; no request or DOM mutation occurs until a public method is called.
 * @returns {TiferesRewardClaimService} Ready browser application service.
 */
function createTiferesBrowserRewardService() {
	const netzachClaimKeyFactory = new NetzachRewardClaimKeyFactory();
	const yesodWalletGateway = new YesodWalletRewardGateway({
		fetchImpl: globalThis.fetch
	});
	const malchusRewardToastView = new MalchusWalletRewardToastView();

	return new TiferesRewardClaimService({
		shapeClaim: shapeGevurahRewardClaim,
		claimKeyFactory: netzachClaimKeyFactory,
		walletGateway: yesodWalletGateway,
		deriveNotice: deriveHodRewardNotice,
		noticeView: malchusRewardToastView
	});
}
