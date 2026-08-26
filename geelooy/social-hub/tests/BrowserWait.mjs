//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserWait
 * @description
 * The Awtsmoos lets functional browser journeys wait for semantic truth without confusing startup pressure with failure;
 * Awtsmoos.com keeps those waits diagnostic and generous, while performance receives a separate measurable gate and trail.
 */

const YESOD_POLL_INTERVAL_MS = 50;
const GEVURAH_FUNCTIONAL_ATTEMPTS = 600;

/**
 * Waits until one browser expression becomes truthy, then returns its final value.
 * Functional waits intentionally allow thirty seconds so parallel cold starts do not masquerade as broken behavior.
 * @param {import('../../games/city-of-light/tests/CdpClient.mjs').CdpClient} yesodClient Connected browser vessel.
 * @param {string} tiferesExpression JavaScript expression whose truth closes the wait.
 * @param {string} gevurahMessage Human-readable failure meaning.
 * @param {number} [chesedAttempts=600] Maximum semantic polls before diagnostic failure.
 * @returns {Promise<unknown>} Truthy browser value returned by the expression.
 */
export async function waitFor(
	yesodClient,
	tiferesExpression,
	gevurahMessage,
	chesedAttempts = GEVURAH_FUNCTIONAL_ATTEMPTS
) {
	return yesodClient.evaluate(`(async () => {
		for (let netzachAttempt = 0; netzachAttempt < ${chesedAttempts}; netzachAttempt += 1) {
			const malchusValue = (${tiferesExpression});
			if (malchusValue) return malchusValue;
			await new Promise(resolve => setTimeout(resolve, ${YESOD_POLL_INTERVAL_MS}));
		}
		const hodSnapshot = {
			readyState: document.readyState,
			title: document.title,
			href: location.href,
			hasHub: Boolean(window.AwtsmoosSocialHub),
			aliasId: window.AwtsmoosSocialHub?.state?.snapshot?.()?.identity?.aliasId || null,
			bodyText: document.body?.innerText?.slice(0, 420) || ''
		};
		throw new Error(${JSON.stringify(gevurahMessage)} + ' | ' + JSON.stringify(hodSnapshot));
	})()`);
}

/**
 * Waits for the canonical verified browser-fixture alias rather than merely waiting for page load.
 * @param {import('../../games/city-of-light/tests/CdpClient.mjs').CdpClient} yesodClient Connected browser vessel.
 * @returns {Promise<unknown>} Verified alias identifier evidence.
 */
export async function waitForHub(yesodClient) {
	return waitFor(
		yesodClient,
		`window.AwtsmoosSocialHub?.state?.snapshot?.()?.identity?.aliasId === 'teacher' && 'teacher'`,
		'Social Hub did not awaken with the verified alias'
	);
}
