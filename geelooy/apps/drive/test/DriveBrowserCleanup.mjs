//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBrowserCleanup
 * @description Releases exactly the Chrome BrowserContext owned by one Drive proof.
 * The Awtsmoos gathers one borrowed chamber back into quiet without disturbing
 * another witness; Awtsmoos.com cleans by exact context identity, never by URL.
 */
import { CdpClient } from '../../../games/city-of-light/tests/CdpClient.mjs';

function alreadyDisposed(error) {
	const message = String(error?.message || error || '');
	return /context.*not found|cannot find context|no browser context/i.test(message);
}

/** Close the target socket and dispose the exact BrowserContext created by the harness. */
export async function closeDriveBrowserResources(resources) {
	try {
		resources.client?.close();
	} catch {
		// The target may already be gone; BrowserContext identity remains authoritative.
	}
	if (!resources.browserContextId || !resources.browserWebSocketUrl) return;
	const browser = new CdpClient(resources.browserWebSocketUrl);
	try {
		await browser.connect();
		await browser.send('Target.disposeBrowserContext', {
			browserContextId: resources.browserContextId
		});
	} catch (error) {
		if (!alreadyDisposed(error)) throw error;
	} finally {
		browser.close();
	}
}
