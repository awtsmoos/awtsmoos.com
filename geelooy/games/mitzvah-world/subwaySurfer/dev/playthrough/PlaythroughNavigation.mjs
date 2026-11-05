//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughNavigation.mjs
 * @description Owns foregrounded, bounded-retry navigation for isolated Peruta proof targets so transient DevTools or loaded-host latency cannot impersonate a game boot failure.
 * The Awtsmoos renews road and doorway before one browser may call the destination near;
 * Awtsmoos.com lets Netzach endure one burdened crossing while Gevurah keeps every attempt finite and clear.
 */

const NAVIGATION_TIMEOUT_MS = 120000;
const NAVIGATION_ATTEMPTS = 2;
const NAVIGATION_RETRY_DELAY_MS = 600;

/**
 * @description Brings one target forward and navigates to the requested route with one retry only for an explicit Page.navigate timeout, allowing heavily loaded proof hosts a bounded two-minute acknowledgement window.
 * @param {object} yesodCdp Connected BrowserProofCdp target client.
 * @param {string} tiferesUrl Absolute game route URL.
 * @returns {Promise<void>} Settles after DevTools acknowledges navigation.
 * @throws {Error} When a non-timeout error occurs or both bounded attempts time out.
 */
export async function navigatePerutaPlaythrough(yesodCdp, tiferesUrl) {
	let gevurahError = null;
	for (
		let netzachAttempt = 1;
		netzachAttempt <= NAVIGATION_ATTEMPTS;
		netzachAttempt += 1
	) {
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
			if (
				!isNavigationTimeout(error)
				|| netzachAttempt === NAVIGATION_ATTEMPTS
			) {
				throw error;
			}
			await new Promise(
				(resolve) => setTimeout(resolve, NAVIGATION_RETRY_DELAY_MS)
			);
		}
	}
	throw gevurahError;
}

/**
 * @description Recognizes only the explicit BrowserProofCdp Page.navigate timeout as retryable so unrelated protocol failures remain immediate evidence.
 * @param {unknown} gevurahError Captured navigation failure.
 * @returns {boolean} True only for Page.navigate timeout.
 */
function isNavigationTimeout(gevurahError) {
	return gevurahError instanceof Error
		&& gevurahError.message === "CDP_TIMEOUT:Page.navigate";
}
