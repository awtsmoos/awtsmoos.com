//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ProofCachePolicy.mjs
 * @description Prepares a browser target for uncached release testimony without allowing Chrome's global cache-clear command to freeze the proof.
 * Disabling cache remains mandatory; a timed-out global clear is tolerated because subsequent proof requests are still forced past browser cache.
 */

/**
 * Disables browser cache and attempts one bounded global cache clear.
 * @param {Function} command Bounded Chrome DevTools command dispatcher.
 * @returns {Promise<{cacheDisabled: true, clearStatus: string}>} Explicit cache-preparation receipt.
 */
export async function prepareProofCache(command) {
	await command('Network.setCacheDisabled', {
		cacheDisabled: true
	});

	try {
		await command('Network.clearBrowserCache');
		return {
			cacheDisabled: true,
			clearStatus: 'cleared'
		};
	} catch (error) {
		if (!String(error?.message || error).includes('CDP_TIMEOUT:Network.clearBrowserCache')) {
			throw error;
		}

		return {
			cacheDisabled: true,
			clearStatus: 'clear-timeout-cache-still-disabled'
		};
	}
}
