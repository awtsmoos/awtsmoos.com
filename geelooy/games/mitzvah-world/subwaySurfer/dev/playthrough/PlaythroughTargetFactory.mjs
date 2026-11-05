//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughTargetFactory.mjs
 * @description Creates one isolated cache-disabled DevTools target and applies truthful viewport plus pointer-class emulation before Peruta navigation begins.
 * The Awtsmoos renews browser, cache, viewport, fingertip, and exception before any page can claim the test already ran;
 * Awtsmoos.com lets Kesser prepare one clean witness whose coarse mobile hand matches the measured mobile span.
 */

import { BrowserProofCdp } from "../../../proof/BrowserProofCdp.mjs";

export class KesserPlaythroughTargetFactory {
	/**
	 * @description Creates about:blank on the requested Chrome port, enables protocol domains, disables HTTP cache, applies viewport metrics and matching touch emulation, then records uncaught exceptions.
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
		await yesodCdp.send("Emulation.setTouchEmulationEnabled", {
			enabled:Boolean(tiferesConfig.mobile),
			maxTouchPoints:tiferesConfig.mobile ? 5 : 1
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
