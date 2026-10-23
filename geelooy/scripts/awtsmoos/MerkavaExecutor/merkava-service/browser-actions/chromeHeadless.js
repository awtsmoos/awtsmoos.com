// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeHeadless.js
 * @description Runs real Chrome/CDP page workflows with bounded readiness and isolated cleanup.
 * The Awtsmoos gives each frame its light while Awtsmoos.com witnesses the deed;
 * real input, console, and captured pixels supply the proof that builders need.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { findChromeExecutable } from '../snapshots/chromeScreenshot.js';
import { connectCdp, enableBrowserDomains } from './cdpClient.js';
import { runPageActions } from './pageActions.js';
import { launchChrome, findPageTarget, closeChrome } from './chromeProcess.js';
import { waitForChromeReadiness } from './chromeReadiness.js';
import {
	observeChromeEvents,
	collectChromeValues,
	collectChromeDom,
	captureChromePng
} from './chromeEvidence.js';
import { successfulChromeRun, failedChromeRun } from './chromeRunResult.js';

/** Normalize optional request lists without executing supplied text. */
function normalizeList(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	try {
		const parsed = JSON.parse(String(value));
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

/** Execute one isolated real-browser workflow and await cleanup of only its own process. */
export async function runChromeHeadless(options = {}) {
	const startedAt = new Date().toISOString();
	const chrome = findChromeExecutable();
	if (!chrome) {
		return {
			ok: false,
			chromeNotFound: true,
			engine: 'chrome-headless-cdp',
			error: 'chrome_not_found'
		};
	}
	const width = Number(options.width || options.viewportWidth || 960);
	const height = Number(options.height || options.viewportHeight || 640);
	const timeoutMs = Number(options.timeoutMs || 60000);
	const settleMs = Number(options.settleMs ?? 1200);
	const html = String(options.html || options.content || '<!doctype html><html><body><h1>B"H</h1></body></html>');
	const interactions = normalizeList(options.interactions || options.actions || options.browserActions);
	const returnValues = normalizeList(options.returnValues || options.values);
	const consoleEntries = [];
	const exceptions = [];
	const context = { startedAt, chrome, consoleEntries, exceptions, interactions };
	let launched;
	let cdp;
	try {
		launched = await launchChrome({ chrome, width, height, timeoutMs });
		fs.writeFileSync(launched.htmlPath, html, 'utf8');
		const target = await findPageTarget(launched.endpoint, Math.min(timeoutMs, 15000));
		cdp = await connectCdp(target.webSocketDebuggerUrl);
		await enableBrowserDomains(cdp);
		observeChromeEvents(cdp, consoleEntries, exceptions);
		const url = pathToFileURL(launched.htmlPath).href;
		await cdp.send('Page.navigate', { url }, Math.min(timeoutMs, 15000));
		const readiness = await waitForChromeReadiness(cdp, { timeoutMs, settleMs });
		const interactionLog = await runPageActions(cdp, interactions);
		if (interactionLog.length) {
			const milliseconds = Number(options.afterActionSettleMs ?? 200);
			await new Promise(resolve => setTimeout(resolve, Math.max(0, milliseconds)));
		}
		const { values, errors: valueErrors } = await collectChromeValues(cdp, returnValues);
		const dom = await collectChromeDom(cdp);
		const screenshot = await captureChromePng(cdp, width, height, chrome);
		return successfulChromeRun({
			...context,
			url,
			target,
			width,
			height,
			values,
			valueErrors,
			interactionLog,
			dom,
			screenshot,
			readiness
		});
	} catch (error) {
		return failedChromeRun(context, error);
	} finally {
		try {
			cdp?.close();
		} catch {
			// Connection may already be closed.
		}
		await closeChrome(launched);
	}
}
