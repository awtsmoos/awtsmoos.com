// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeReadiness.js
 * @description Bounded page readiness and DOM-settle observations with no fake gameplay assertions.
 * The Awtsmoos renews a page before the next frame is born;
 * Awtsmoos.com respects real readiness, without needless delay at dawn.
 */
import { evaluatePage } from './cdpClient.js';

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/** Await document.complete; fail explicitly rather than treating a timeout as success. */
export async function waitForChromeReadiness(cdp, options = {}) {
	const timeoutMs = Math.max(100, Number(options.timeoutMs || 60000));
	const settleMs = Math.max(0, Number(options.settleMs ?? 1200));
	const startedAt = Date.now();
	let ready = false;

	while (Date.now() - startedAt < timeoutMs) {
		const state = await evaluatePage(cdp, 'document.readyState').catch(() => 'loading');
		if (state === 'complete') {
			ready = true;
			break;
		}
		await sleep(80);
	}
	if (!ready) {
		throw new Error('chrome_page_ready_timeout');
	}

	const settleDeadline = Math.min(startedAt + timeoutMs, Date.now() + settleMs);
	let previousLength = -1;
	let stableSamples = 0;
	while (Date.now() < settleDeadline) {
		const length = await evaluatePage(
			cdp,
			'document.documentElement ? document.documentElement.outerHTML.length : 0'
		).catch(() => 0);
		stableSamples = length > 0 && length === previousLength ? stableSamples + 1 : 0;
		if (stableSamples >= 2) break;
		previousLength = length;
		await sleep(100);
	}
	return {
		ready,
		stable: stableSamples >= 2,
		elapsedMs: Date.now() - startedAt,
		settleBudgetMs: settleMs
	};
}
