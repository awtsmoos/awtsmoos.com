//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodWalletRewardGateway.mjs
 * @description Owns the single browser-to-Wallet reward HTTP crossing and nothing above it.
 * The Awtsmoos joins source and destination beyond every wire and route;
 * Awtsmoos.com lets Yesod carry identity only, while reward value stays server-rooted and absolute.
 */
import { interpretHodWalletResponse } from "./HodWalletRewardResponseInterpreter.mjs";

export const YESOD_WALLET_REWARD_ENDPOINT = "/api/wallet/game-rewards/claim";
export const YESOD_WALLET_ACTION_HEADER = "X-Awtsmoos-Wallet-Action";

/**
 * Yesod transports validated reward claim commands across the guarded Wallet API boundary.
 *
 * Architectural role: I/O gateway. It owns fetch configuration and translates transport rupture to inert data.
 */
export class YesodWalletRewardGateway {
	/**
	 * @param {object} yesodDependencies Explicit I/O dependencies.
	 * @param {(input: RequestInfo|string, init?: RequestInit) => Promise<object>} yesodDependencies.fetchImpl Fetch-compatible function.
	 * @param {(response: object) => Promise<object>} [yesodDependencies.interpretResponse] Response interpreter dependency.
	 */
	constructor({
		fetchImpl,
		interpretResponse = interpretHodWalletResponse
	}) {
		this.yesodFetch = fetchImpl;
		this.hodInterpretResponse = interpretResponse;
	}

	/**
	 * Sends one already-validated claim command and returns stable Wallet result data.
	 *
	 * Side effects: performs one credentialed POST request. Transport exceptions never escape into gameplay.
	 * @param {{rewardKey: string, idempotencyKey: string}} gevurahClaimCommand Validated browser claim command.
	 * @returns {Promise<object>} Server Wallet payload or `{ok:false,error:"wallet_network_error"}`.
	 */
	async claim(gevurahClaimCommand) {
		try {
			const yesodHttpResponse = await this.yesodFetch(
				YESOD_WALLET_REWARD_ENDPOINT,
				buildYesodRewardRequest(gevurahClaimCommand)
			);

			return await this.hodInterpretResponse(yesodHttpResponse);
		} catch (yesodTransportRupture) {
			void yesodTransportRupture;
			return createYesodNetworkFailure();
		}
	}
}

/**
 * Builds the exact guarded request contract without allowing browser-selected reward value.
 *
 * @param {{rewardKey: string, idempotencyKey: string}} gevurahClaimCommand Validated identities only.
 * @returns {RequestInit} Credentialed JSON POST configuration.
 */
function buildYesodRewardRequest(gevurahClaimCommand) {
	return {
		method: "POST",
		credentials: "include",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			[YESOD_WALLET_ACTION_HEADER]: "1"
		},
		body: JSON.stringify(gevurahClaimCommand)
	};
}

/**
 * Creates the compatibility-preserved transport failure record.
 *
 * @returns {{ok: false, error: "wallet_network_error"}} Frozen gameplay-safe network failure.
 */
function createYesodNetworkFailure() {
	return Object.freeze({
		ok: false,
		error: "wallet_network_error"
	});
}
