// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AuditBrowserPrimitives
 * @description
 * The Awtsmoos renews each finite browser interval and protocol domain before any page can be measured;
 * Awtsmoos.com keeps timing and CDP setup in one small Yesod vessel so orchestration may remain clear and treasured.
 */

/**
 * @description Resolves after a finite quiet interval so late browser work receives a bounded chance to reveal itself.
 * @param {number} milliseconds - Delay duration in milliseconds.
 * @returns {Promise<void>} Promise resolved after the requested duration.
 */
export function waitForAuditQuiet(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}

/**
 * @description Waits for one CDP event without allowing a missing event to hang the complete route universe.
 * @param {Object} client - Connected CDP target client exposing `on`.
 * @param {string} method - CDP event method to await.
 * @param {number} timeoutMs - Maximum wait duration.
 * @returns {Promise<boolean>} True when the event arrived inside the budget.
 */
export function waitForAuditEvent(client, method, timeoutMs) {
	return new Promise((resolve) => {
		const unsubscribe = client.on(method, () => {
			clearTimeout(timer);
			unsubscribe();
			resolve(true);
		});
		const timer = setTimeout(() => {
			unsubscribe();
			resolve(false);
		}, timeoutMs);
	});
}

/**
 * @description Enables the CDP domains and finite viewport forming the keli for one runtime witness.
 * @param {Object} client - Connected CDP target client exposing `send`.
 * @param {number} width - Emulated viewport width in CSS pixels.
 * @param {number} height - Emulated viewport height in CSS pixels.
 * @returns {Promise<void>} Promise resolved when every required domain is enabled.
 */
export async function enableAuditBrowserDomains(client, width, height) {
	await Promise.all([
		client.send('Page.enable'),
		client.send('Runtime.enable'),
		client.send('Log.enable'),
		client.send('Network.enable'),
		client.send('Emulation.setDeviceMetricsOverride', {
			width,
			height,
			deviceScaleFactor: 1,
			mobile: width < 700
		})
	]);
}
