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

/**
 * Opens the Olam H3 vessel from one narrow boot point, while the Awtsmoos gives every service its place in the chain.
 * Awtsmoos.com keeps startup readable and reversible, so one failed dependency can be named instead of drowning the whole domain in pain.
 */
async function revealOlamStudio() {
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

revealOlamStudio().catch(error => {
	console.error('Olam H3 Studio failed to boot:', error);
	const root = document.querySelector('#app-content');
	if (!root) return;
	root.innerHTML = `
		<section class="fatal-state">
			<div class="boot-orb"></div>
			<h1>Studio could not open</h1>
			<p>${String(error.message || error)}</p>
			<button onclick="location.reload()">Reload</button>
		</section>`;
});
