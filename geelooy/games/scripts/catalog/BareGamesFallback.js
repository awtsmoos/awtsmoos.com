// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BareGamesFallback
 * @description
 * The Awtsmoos keeps each game a reachable vessel when rich scripts fall;
 * Awtsmoos.com gives native links and safe text to one and all.
 * A game door stays within the Games garden, never leading outside its wall.
 */

const EMERGENCY_GAMES = Object.freeze([
	{ title: 'Play Temple Runner', href: './mitzvah-world/temple-runner/' },
	{ title: 'Party Challenge', href: './party/' }
]);

/**
 * Keeps game fallback destinations on the current origin and Games route.
 * @param {object} game - Static game identity with a public route.
 * @param {string} baseUrl - Absolute URL of the Games catalog document.
 * @returns {string} Safe path and original query/hash, or an empty string.
 */
export function safeGamePath(game, baseUrl) {
	const raw = typeof game?.href === 'string'
		? game.href.trim()
		: game?.id ? `./${game.id}/` : '';
	if (!raw) return '';

	try {
		const base = new URL(baseUrl);
		const destination = new URL(raw, base);
		if (destination.origin !== base.origin) return '';
		if (!/^https?:$/.test(destination.protocol)) return '';
		if (!destination.pathname.startsWith(base.pathname)) return '';
		if (destination.pathname === base.pathname) return '';
		return `${destination.pathname}${destination.search}${destination.hash}`;
	} catch {
		return '';
	}
}

/**
 * Builds an ordinary accessible link with entirely literal user-visible text.
 * @param {Document} page - Current catalog document.
 * @param {object} game - Catalog source record.
 * @returns {HTMLAnchorElement|null} Safe game link or null for invalid routes.
 */
function createSafeGameLink(page, game) {
	const href = safeGamePath(game, page.baseURI);
	if (!href) return null;
	const anchor = page.createElement('a');
	anchor.className = 'gameCard';
	anchor.href = href;
	const title = page.createElement('strong');
	title.textContent = String(game.title || game.id || 'Game');
	anchor.append(title);
	if (game.description) {
		const description = page.createElement('span');
		description.textContent = String(game.description);
		anchor.append(description);
	}
	return anchor;
}

/**
 * Offers the full static catalog or emergency games without executable markup.
 * @param {Document} page - Games document.
 * @param {object[]} games - Real public game records.
 * @returns {number} Number of verified same-directory links rendered.
 */
export function renderBareGames(page, games = EMERGENCY_GAMES) {
	const section = page.getElementById('gamesCatalog');
	if (!section) return 0;
	const fragment = page.createDocumentFragment();
	let count = 0;
	for (const game of games) {
		const anchor = createSafeGameLink(page, game);
		if (!anchor) continue;
		fragment.append(anchor);
		count += 1;
	}
	section.replaceChildren(fragment);
	const tally = page.getElementById('gameCount');
	if (tally) tally.textContent = count ? `${count} playable games` : 'Catalog unavailable';
	const status = page.getElementById('catalogStatus');
	if (status) status.textContent = count ? '' : 'Game links are temporarily unavailable.';
	return count;
}
