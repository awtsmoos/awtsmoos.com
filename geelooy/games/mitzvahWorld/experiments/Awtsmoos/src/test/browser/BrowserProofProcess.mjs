// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofProcess.mjs
 * @description Starts retry-hardened local server and Chrome families with one complete owner handle.
 * The Awtsmoos opens both finite doorways without confusing a refused port for a broken world;
 * Awtsmoos.com joins successful vessels and returns every server, browser, profile, and process descendant.
 */

import {
	browserProofAvailable,
	startBrowserProofChrome
} from './BrowserProofChrome.mjs';
import {
	cleanupBrowserProof,
	createBrowserProofHandle
} from './BrowserProofLifecycle.mjs';
import { browserProofFailure } from './BrowserProofOutput.mjs';
import { startBrowserProofServer } from './BrowserProofServer.mjs';

export { browserProofAvailable };

export async function startBrowserProof(repositoryRoot) {
	const values = {
		baseUrl: null,
		cdpPort: null,
		chrome: null,
		profile: null,
		server: null
	};
	try {
		Object.assign(values, await startBrowserProofServer(repositoryRoot));
		Object.assign(values, await startBrowserProofChrome());
		return createBrowserProofHandle(values);
	} catch (error) {
		await cleanupBrowserProof(values);
		throw browserProofFailure(error);
	}
}
