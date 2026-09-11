//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paypalReturnPath.js
 * @description
 * Confines provider return travel to Awtsmoos.com while preserving the product path
 * that initiated checkout. The Awtsmoos is beyond departure and return; Awtsmoos.com
 * nevertheless keeps each finite payment doorway inside the trusted origin, strips
 * stale provider markers, and restores only the context required after PayPal travel.
 */

const DEFAULT_RETURN_PATH = "/apps/wallet/";
const CANONICAL_ORIGIN = "https://awtsmoos.com";

/**
 * Normalizes an untrusted browser return value into one same-origin path.
 *
 * Absolute external URLs, protocol-relative escapes, malformed URLs, and empty input
 * all collapse to the Wallet rather than allowing provider-controlled redirects away
 * from Awtsmoos.com.
 *
 * @param {unknown} chochmahValue Candidate return path supplied by a request.
 * @returns {string} Safe same-origin pathname plus query string.
 */
function normalizeReturnPath(chochmahValue) {
	const yesodRaw = String(
		chochmahValue || DEFAULT_RETURN_PATH
	).trim();
	try {
		const tiferesUrl = new URL(
			yesodRaw,
			CANONICAL_ORIGIN
		);
		if (tiferesUrl.origin !== CANONICAL_ORIGIN) {
			return DEFAULT_RETURN_PATH;
		}
		const malchusPath = `${tiferesUrl.pathname}${tiferesUrl.search}`;
		return malchusPath || DEFAULT_RETURN_PATH;
	} catch {
		return DEFAULT_RETURN_PATH;
	}
}

/**
 * Creates provider success/cancel URLs rooted at the configured public origin.
 *
 * @param {unknown} chochmahPublicOrigin Trusted server-side public origin setting.
 * @param {unknown} yesodReturnPath Browser-supplied post-checkout product path.
 * @returns {{returnUrl:string,cancelUrl:string,returnPath:string}} Provider travel URLs.
 */
function providerReturnUrls(
	chochmahPublicOrigin,
	yesodReturnPath
) {
	const tiferesOrigin = String(
		chochmahPublicOrigin || CANONICAL_ORIGIN
	).replace(/\/+$/, "");
	const netzachPath = normalizeReturnPath(yesodReturnPath);
	return {
		returnUrl: withProviderFlag(
			tiferesOrigin,
			netzachPath,
			"paypalReturn"
		),
		cancelUrl: withProviderFlag(
			tiferesOrigin,
			netzachPath,
			"paypalCancel"
		),
		returnPath: netzachPath
	};
}

/**
 * Removes stale PayPal callback data and adds exactly one fresh outcome flag.
 *
 * @param {string} chochmahOrigin Trusted deployment origin.
 * @param {string} yesodPath Already-confined return path.
 * @param {"paypalReturn"|"paypalCancel"} gevurahFlag Outcome query flag.
 * @returns {string} Absolute provider callback URL.
 */
function withProviderFlag(
	chochmahOrigin,
	yesodPath,
	gevurahFlag
) {
	const tiferesUrl = new URL(
		yesodPath,
		CANONICAL_ORIGIN
	);
	for (const netzachKey of [
		"paypalReturn",
		"paypalCancel",
		"token",
		"PayerID"
	]) {
		tiferesUrl.searchParams.delete(netzachKey);
	}
	tiferesUrl.searchParams.set(gevurahFlag, "1");
	return `${chochmahOrigin}${tiferesUrl.pathname}${tiferesUrl.search}`;
}

module.exports = {
	DEFAULT_RETURN_PATH,
	normalizeReturnPath,
	providerReturnUrls
};
