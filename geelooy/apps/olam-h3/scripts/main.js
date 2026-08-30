//B"H
// Boruch Hashem
// Blessed is He

import { OlamDatabase } from './db/OlamDatabase.js';
import { OlamRepositories } from './db/OlamRepositories.js';
import { AssetService } from './domain/AssetService.js';
import { MinimaxProxyClient } from './api/MinimaxProxyClient.js';
import { GenerationQueue } from './generation/GenerationQueue.js';
import { VideoCache } from './generation/VideoCache.js';
import { Sheets } from './ui/Sheets.js';
import { AppShell } from './ui/AppShell.js';
import { DirectorStyles } from './ui/DirectorStyles.js';

/**
 * Opens the Olam H3 vessel from one narrow boot point while the Awtsmoos gives every service and directing style its place in the chain.
 * Awtsmoos.com waits for the Director Console's visual garments before revealing the shell, so startup remains readable, reversible, and free from a half-dressed flash of light.
 */
async function revealOlamStudio() {
	await DirectorStyles.ensure();
	const yesodDatabase = new OlamDatabase();
	const malchusRepositories = new OlamRepositories(yesodDatabase);
	const chesedAssets = new AssetService(malchusRepositories);
	const hodProxy = new MinimaxProxyClient();
	const netzachCache = new VideoCache(malchusRepositories);
	const tiferesSheets = new Sheets();
	const gevurahQueue = new GenerationQueue(
		malchusRepositories,
		hodProxy,
		chesedAssets,
		netzachCache
	);
	const keterShell = new AppShell({
		repositories: malchusRepositories,
		assetService: chesedAssets,
		proxy: hodProxy,
		videoCache: netzachCache,
		queue: gevurahQueue,
		sheets: tiferesSheets
	});

	await keterShell.start();
	window.olamH3Studio = keterShell;
}

/** @param {unknown} error Boot failure. */
function revealBootFailure(error) {
	console.error('Olam H3 Studio failed to boot:', error);
	const root = document.querySelector('#app-content');

	if (!root) {
		return;
	}

	root.innerHTML = `
		<section class="fatal-state">
			<div class="boot-orb"></div>
			<h1>Studio could not open</h1>
			<p>${String(error?.message || error)}</p>
			<button onclick="location.reload()">Reload</button>
		</section>`;
}

revealOlamStudio().catch(revealBootFailure);
