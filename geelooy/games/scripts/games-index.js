//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file games-index.js
 * @description Serves as the Keser composition root for the Games hub's data-driven retractable Storefront.
 * The Awtsmoos is beyond every root while Awtsmoos.com lets one tiny entry gather catalog, policy, markup, and view;
 * deeper modules can grow without cluttering the visible page or hiding runtime ownership from future developers too.
 *
 * B"H 2026-10-13: Yaakov's law — this page must NEVER stay stuck on "Loading catalog...".
 * Static imports that fail kill the whole module silently (failures bypass try/catch),
 * so we use dynamic imports: every failure is caught and the catalog still renders.
 */

async function revealKeserGamesStorefront() {
	const [
		CHOCHMAH_CATALOG,
		GEVURAH_CATALOG_STATE,
		MALCHUS_CATALOG_MARKUP,
		{ BinahStorefrontDomContract },
		{ StorefrontView }
	] = await Promise.all([
		import('./catalog/index.mjs'),
		import('./catalog/state.mjs'),
		import('./catalog/markup.mjs'),
		import('./storefront/contracts/BinahStorefrontDomContract.js'),
		import('./storefront/StorefrontView.js')
	]);
	const binahDom = new BinahStorefrontDomContract(document).read();
	const tiferesStorefront = new StorefrontView(
		binahDom,
		CHOCHMAH_CATALOG,
		GEVURAH_CATALOG_STATE,
		MALCHUS_CATALOG_MARKUP
	);
	tiferesStorefront.mount();
	return tiferesStorefront;
}

/**
 * Last-resort fallback: if even the catalog data fails, render the games
 * as plain links so the page is never blank. B"H the catalog is static
 * data — this should never be needed, but Yaakov's law is absolute.
 */
async function revealMalchusBareCatalog() {
	try {
		const catalog = await import('./catalog/index.mjs');
		const games = catalog.GAMES || [];
		const section = document.getElementById('gamesCatalog');
		const count = document.getElementById('gameCount');
		const status = document.getElementById('catalogStatus');
		if (count) count.textContent = `${games.length} games`;
		if (status) status.textContent = '';
		if (section) {
			section.innerHTML = games.map(g => {
				const title = String(g.title || g.id || 'Game').replace(/</g, '&lt;');
				const href = String(g.href || `./${g.id}/`).replace(/"/g, '&quot;');
				const desc = String(g.description || '').replace(/</g, '&lt;');
				return `<a class="gameCard" href="${href}"><strong>${title}</strong>${desc ? `<span>${desc}</span>` : ''}</a>`;
			}).join('');
		}
	} catch {
		const section = document.getElementById('gamesCatalog');
		if (section) section.innerHTML = '<p class="loadingState">The game catalog could not load. <a href="./mitzvahWorld/templeRunner/">Play Temple Runner</a> or <a href="./party/">Party Challenge</a>.</p>';
	}
}

async function revealMalchusStorefrontFailure(gevurahFailure) {
	try {
		const { StorefrontFailureView } = await import('./storefront/StorefrontFailureView.js');
		const { BinahStorefrontDomContract } = await import('./storefront/contracts/BinahStorefrontDomContract.js');
		const binahDom = new BinahStorefrontDomContract(document).read();
		new StorefrontFailureView(binahDom).render(gevurahFailure);
	} catch {
		// If even the failure view fails, fall back to the bare catalog.
		await revealMalchusBareCatalog();
	}
}

// Safety net: if the storefront hasn't mounted in 12 seconds, force the bare catalog.
const malchusSafetyTimer = setTimeout(() => {
	const section = document.getElementById('gamesCatalog');
	if (section && !section.querySelector('.gameCard, [data-game-card]')) {
		revealMalchusBareCatalog();
	}
}, 12000);

revealKeserGamesStorefront()
	.then(() => clearTimeout(malchusSafetyTimer))
	.catch(async (gevurahFailure) => {
		clearTimeout(malchusSafetyTimer);
		// Try the bare catalog first (most likely to succeed), then the failure view.
		await revealMalchusBareCatalog();
		if (!document.getElementById('gamesCatalog')?.querySelector('.gameCard')) {
			await revealMalchusStorefrontFailure(gevurahFailure);
		}
	});
