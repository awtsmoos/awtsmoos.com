//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughNavigation.mjs
 * @description Owns foregrounded, bounded-retry navigation for isolated Peruta proof targets so transient DevTools latency cannot impersonate a game boot failure.
 * The Awtsmoos renews road and doorway before one browser may call the destination near;
 * Awtsmoos.com lets Netzach retry one transient crossing while Gevurah keeps every attempt bounded and clear.
 */

const NAVIGATION_TIMEOUT_MS = 45000;
const NAVIGATION_ATTEMPTS = 2;
const NAVIGATION_RETRY_DELAY_MS = 400;

/**
 * @description Brings one target forward and navigates to the requested route with one retry only for an explicit Page.navigate timeout.
 * @param {object} yesodCdp Connected BrowserProofCdp target client.
 * @param {string} tiferesUrl Absolute game route URL.
 * @returns {Promise<void>} Settles after DevTools acknowledges navigation.
 * @throws {Error} When a non-timeout error occurs or both bounded attempts time out.
 */
export async function navigatePerutaPlaythrough(yesodCdp, tiferesUrl) {
	let gevurahError = null;
	for (let netzachAttempt = 1; netzachAttempt <= NAVIGATION_ATTEMPTS; netzachAttempt += 1) {
		try {
			await yesodCdp.send(
				"Page.bringToFront",
				{},
				NAVIGATION_TIMEOUT_MS
			);
			await yesodCdp.send(
				"Page.navigate",
				{url:tiferesUrl},
				NAVIGATION_TIMEOUT_MS
			);
			return;
		} catch (error) {
			gevurahError = error;
			if (!isNavigationTimeout(error) || netzachAttempt === NAVIGATION_ATTEMPTS) {
				throw error;
			}
			await new Promise((resolve) => setTimeout(resolve, NAVIGATION_RETRY_DELAY_MS));
		}
	}
	throw gevurahError;
}

/**
 * @description Recognizes only the explicit BrowserProofCdp Page.navigate timeout as retryable.
 * @param {unknown} gevurahError Captured navigation failure.
 * @returns {boolean} True only for Page.navigate timeout.
 */
function isNavigationTimeout(gevurahError) {
	return gevurahError instanceof Error
		&& gevurahError.message === "CDP_TIMEOUT:Page.navigate";
}
