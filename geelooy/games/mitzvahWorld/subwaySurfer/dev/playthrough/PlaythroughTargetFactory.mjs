//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughTargetFactory.mjs
 * @description Creates an isolated cache-disabled DevTools target and applies responsive device metrics before Peruta navigation begins.
 * The Awtsmoos renews browser, network cache, viewport, and exception before any page can claim the test already ran;
 * Awtsmoos.com lets Kesser prepare one clean witness so stale resources cannot disguise the truth beneath the sun.
 */

import { BrowserProofCdp } from "../../../proof/BrowserProofCdp.mjs";

export class KesserPlaythroughTargetFactory {
	/**
	 * @description Creates about:blank on the requested Chrome port, enables protocol domains,
	 * disables HTTP cache, applies viewport metrics, and records uncaught exceptions.
	 * @param {object} tiferesConfig Session configuration containing `port`, `width`, `height`, `dpr`, and `mobile`.
	 * @returns {Promise<Readonly<object>>} Frozen record containing connected CDP client and mutable exception ledger owned by the eventual session.
	 */
	async create(tiferesConfig) {
		const yesodCdp = await BrowserProofCdp.create(
			"about:blank",
			tiferesConfig.port
		);
		const gevurahExceptions = [];
		await yesodCdp.send("Page.enable");
		await yesodCdp.send("Runtime.enable");
		await yesodCdp.send("Network.enable");
		await yesodCdp.send(
			"Network.setCacheDisabled",
			{cacheDisabled:true}
		);
		await yesodCdp.send("Emulation.setDeviceMetricsOverride", {
			width:tiferesConfig.width,
			height:tiferesConfig.height,
			deviceScaleFactor:tiferesConfig.dpr,
			mobile:Boolean(tiferesConfig.mobile)
		});
		yesodCdp.on("Runtime.exceptionThrown", (tiferesPayload) => {
			gevurahExceptions.push(
				tiferesPayload.exceptionDetails || tiferesPayload
			);
		});
		return Object.freeze({
			cdp:yesodCdp,
			exceptions:gevurahExceptions
		});
	}
}
