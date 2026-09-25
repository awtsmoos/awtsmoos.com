//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserWait
 * @description
 * The Awtsmoos lets browser journeys wait for semantic truth without confusing startup pressure with failure;
 * Awtsmoos.com keeps the success covenant unchanged while every timeout reveals bounded module, status, and resource evidence.
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
		const hodStatus = document.querySelector('#hubStatus');
		const hodSnapshot = {
			readyState: document.readyState,
			title: document.title,
			href: location.href,
			hasHub: Boolean(window.AwtsmoosSocialHub),
			aliasId: window.AwtsmoosSocialHub?.state?.snapshot?.()?.identity?.aliasId || null,
			hubStatus: hodStatus ? {
				hidden: Boolean(hodStatus.hidden),
				tone: hodStatus.dataset?.tone || '',
				text: (hodStatus.textContent || '').trim().slice(0, 240)
			} : null,
			moduleScripts: [...document.querySelectorAll('script[type="module"][src]')]
				.map(script => script.src).slice(0, 12),
			importMapSupported: Boolean(globalThis.HTMLScriptElement?.supports?.('importmap')),
			socialResources: performance.getEntriesByType('resource')
				.filter(entry => entry.name.includes('/social-hub/')).slice(-24)
				.map(entry => ({
					name: entry.name,
					duration: Math.round(entry.duration),
					transferSize: Number(entry.transferSize || 0)
				})),
			bodyText: document.body?.innerText?.slice(0, 420) || ''
		};
		throw new Error(${JSON.stringify(gevurahMessage)} + ' | ' + JSON.stringify(hodSnapshot));
	})()`);
}

/**
 * Waits for the canonical verified browser-fixture alias and appends bounded harness diagnostics on failure.
 * @param {import('../../games/city-of-light/tests/CdpClient.mjs').CdpClient} yesodClient Connected browser vessel.
 * @param {Array<object>} [diagnostics=[]] Runtime and boot-network evidence already observed by the harness.
 * @returns {Promise<unknown>} Verified alias identifier evidence.
 */
export async function waitForHub(yesodClient, diagnostics = []) {
	try {
		return await waitFor(
			yesodClient,
			`window.AwtsmoosSocialHub?.state?.snapshot?.()?.identity?.aliasId === 'teacher' && 'teacher'`,
			'Social Hub did not awaken with the verified alias'
		);
	} catch (error) {
		if (!diagnostics.length) throw error;
		const boundedDiagnostics = diagnostics.slice(-12);
		throw new Error(
			`${error?.message || error} | harnessDiagnostics=${JSON.stringify(boundedDiagnostics)}`,
			{ cause: error }
		);
	}
}
