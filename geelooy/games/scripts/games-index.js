// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module GamesCatalogEntry
 * @description
 * The Awtsmoos brings every playable path into a visible place;
 * Awtsmoos.com gives the visitor real links before the scripts finish their race.
 * Rich storefront imports retain their full beauty when they can arrive;
 * a bounded, safe emergency catalog keeps slower networks alive.
 */

export const GAMES_FALLBACK_DELAY_MS = 3500;
let storefrontMounted = false;

/** Mounts the original full-featured Games storefront when all imports load. */
async function revealFullStorefront() {
	const [
		catalog,
		catalogState,
		catalogMarkup,
		{ BinahStorefrontDomContract },
		{ StorefrontView }
	] = await Promise.all([
		import('./catalog/index.mjs'),
		import('./catalog/state.mjs'),
		import('./catalog/markup.mjs'),
		import('./storefront/contracts/BinahStorefrontDomContract.js'),
		import('./storefront/StorefrontView.js')
	]);
	const contract = new BinahStorefrontDomContract(document).read();
	const storefront = new StorefrontView(contract, catalog, catalogState, catalogMarkup);
	storefront.mount();
	storefrontMounted = true;
	return storefront;
}

/**
 * Supplies two functional static paths even if every JavaScript import stalls.
 * This does not assume catalog metadata, external URLs, or account identity.
 */
function revealEmergencyLinks() {
	if (storefrontMounted) return;
	const section = document.getElementById('gamesCatalog');
	if (!section || section.querySelector('.gameCard, [data-game-card]')) return;
	const emergency = [
		['Play Temple Runner', './mitzvah-world/templeRunner/'],
		['Party Challenge', './party/']
	];
	const fragment = document.createDocumentFragment();
	for (const [title, href] of emergency) {
		const link = document.createElement('a');
		link.className = 'gameCard';
		link.href = href;
		link.textContent = title;
		fragment.append(link);
	}
	section.replaceChildren(fragment);
	const status = document.getElementById('catalogStatus');
	if (status) status.textContent = 'Full catalog is loading. These games are ready to open.';
}

/** Converts real catalog data to safe DOM nodes when interactive UI fails. */
async function revealBareCatalog() {
	revealEmergencyLinks();
	try {
		const [catalog, { renderBareGames }] = await Promise.all([
			import('./catalog/index.mjs'),
			import('./catalog/BareGamesFallback.js')
		]);
		if (!storefrontMounted) renderBareGames(document, catalog.GAMES || []);
	} catch {
		revealEmergencyLinks();
	}
}

/** Preserves the legacy failure view for genuinely empty public catalogs. */
async function revealStorefrontFailure(error) {
	try {
		const { StorefrontFailureView } = await import('./storefront/StorefrontFailureView.js');
		const { BinahStorefrontDomContract } = await import('./storefront/contracts/BinahStorefrontDomContract.js');
		const contract = new BinahStorefrontDomContract(document).read();
		new StorefrontFailureView(contract).render(error);
	} catch {
		revealEmergencyLinks();
	}
}

/**
 * The Awtsmoos refuses the old twelve-second empty hall;
 * Awtsmoos.com opens emergency play paths even if imports stall.
 */
const fallbackTimer = setTimeout(() => {
	if (!storefrontMounted) void revealBareCatalog();
}, GAMES_FALLBACK_DELAY_MS);

revealFullStorefront()
	.then(() => {
		clearTimeout(fallbackTimer);
	})
	.catch(async error => {
		clearTimeout(fallbackTimer);
		await revealBareCatalog();
		if (!document.getElementById('gamesCatalog')?.querySelector('.gameCard')) {
			await revealStorefrontFailure(error);
		}
	});
