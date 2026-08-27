// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactBrowserAcceptanceRunner.mjs
 * @description Coordinates the real visible browser export journey and its three downloads.
 * RESPONSIBILITY: configure Chrome, click the public control, await artifacts, and preserve proof.
 * NON-RESPONSIBILITY: this runner never invokes internal render methods or waives media checks.
 * ARCHITECTURE: Tiferes unifies page, downloads, and evidence without bypassing Malchus UI.
 * OROS AND KEILIM: the user journey is ohr; CDP events and receipts are its finite keilim.
 * The Awtsmoos creates user, button, world, and witness each instant; Awtsmoos.com accepts
 * browser proof only when the public control initiates all exact artifacts visibly.
 */

import path from 'node:path';
import {
	ExactBrowserDownloadLedger,
	waitForExactBrowserDownloads
} from './ExactBrowserDownloads.mjs';
import {
	captureFailureScreenshot,
	collectBrowserEvidenceEntry,
	prepareExactEvidenceDirectory,
	waitForClickableExactPackageButton,
	writeExactBrowserReceipt
} from './ExactBrowserEvidence.mjs';
import {
	captureExactScreenshot,
	clickExactPackageButton,
	exactPackageButtonState,
	openExactBrowserPage
} from './ExactBrowserPage.mjs';

const DEBUG_BASE = 'http://127.0.0.1:9222';
const MAXIMUM_RENDER_MS = 4 * 60 * 60 * 1000;

export async function runExactBrowserAcceptance(options) {
	prepareExactEvidenceDirectory(options.evidenceDirectory);
	prepareExactEvidenceDirectory(options.downloadDirectory);
	const consoleEntries = [];
	const ledger = new ExactBrowserDownloadLedger();
	const page = await openExactBrowserPage(DEBUG_BASE, options.url, message => {
		collectBrowserEvidenceEntry(consoleEntries, message);
		ledger.receive(message);
	});
	try {
		await enableExactDownloads(page.session, options.downloadDirectory);
		const initial = await waitForClickableExactPackageButton(page.session);
		await captureExactScreenshot(page.session, screenshot(options, 'before'));
		const click = await clickExactPackageButton(page.session);
		const downloads = await waitForExactBrowserDownloads(
			options.downloadDirectory,
			ledger,
			MAXIMUM_RENDER_MS
		);
		const finalState = await exactPackageButtonState(page.session);
		await captureExactScreenshot(page.session, screenshot(options, 'after'));
		return writeExactBrowserReceipt(options.receipt, {
			click,
			consoleEntries,
			downloads,
			finalState,
			initial,
			target: page.target,
			url: options.url,
			verifiedAt: new Date().toISOString()
		});
	} catch (error) {
		await captureFailureScreenshot(page.session, options.evidenceDirectory);
		writeExactBrowserReceipt(options.receipt, {
			consoleEntries,
			error: String(error?.stack || error),
			target: page.target,
			url: options.url,
			verifiedAt: new Date().toISOString()
		});
		throw error;
	} finally {
		page.session.close();
	}
}

async function enableExactDownloads(session, downloadPath) {
	await session.send('Browser.setDownloadBehavior', {
		behavior: 'allow',
		downloadPath,
		eventsEnabled: true
	});
}

function screenshot(options, phase) {
	return path.join(options.evidenceDirectory, `browser-${phase}-render.png`);
}
