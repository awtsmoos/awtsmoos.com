// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The Awtsmoos gathers every verified public doorway into one searchable map:
 * Torah, people, games, tools, treasury, machine connection, and creation remain
 * distinct finite vessels while Awtsmoos.com gives the traveler one honest path.
 */

export const WORLD_CATALOG = Object.freeze([
	createWorld("ikar", "Ikar", "Central Heichel", "/heichelos/ikar", "א", ["main", "central", "heichel"]),
	createWorld("torah", "Torah", "Learn from the living library", "/mawgawl/sefarim/", "ת", ["sefarim", "books", "learn", "study"]),
	createWorld("feed", "Feed", "Posts, people, and community", "/social-hub/", "◌", ["social", "posts", "people", "community"]),
	createWorld("mail", "Mail", "Private messages", "/email/", "✉", ["email", "messages", "inbox"], false),
	createWorld("games", "Games", "Original worlds and quick play", "/games/", "◆", ["play", "originals", "arcade", "worlds"]),
	createWorld("apps", "Apps", "Create, edit, compute, and build", "/apps/", "✦", ["tools", "software", "create", "studio"]),
	createWorld("wallet", "Wallet", "Perutahs, provenance, and purchases", "/apps/wallet/", "◇", ["perutah", "coins", "balance", "payments", "treasury"]),
	createWorld("os", "OS", "Open the Awtsmoos workspace", "/os", "◈", ["desktop", "workspace", "system"]),
	createWorld("code", "Code", "Edit real projects", "/apps/code", "</>", ["editor", "programming", "build", "developer"]),
	createWorld("tunnel", "Tunnel Control", "Connect a local machine", "/apps/tunnel-control/", "↔", ["local", "machine", "agent", "connect", "tunnel"]),
	createWorld("spaces", "Spaces", "Explore all Heichelos", "/heichelos", "∞", ["heichel", "worlds", "rooms"]),
	createWorld("profile", "Profile", "Your living identity", "/profile", "●", ["account", "identity", "alias"], false),
	createWorld("about", "About", "What is Awtsmoos?", "/about", "?", ["mission", "information", "awtsmoos"]),
	createWorld("contact", "Contact", "Send a signal", "/contact/", "↗", ["message", "help", "signal"], false)
]);

export const POPULAR_TORAH_SEARCHES = Object.freeze([
	{ label: "בראשית", query: "בראשית" },
	{ label: "Moshe", query: "moshe" },
	{ label: "Shabbos", query: "shabbos" }
]);

export const WORLD_BY_ID = new Map(
	WORLD_CATALOG.map((world) => {
		return [world.id, world];
	})
);

/**
 * Creates one immutable search-catalog doorway.
 *
 * @param {string} id
 * 	Stable catalog identifier.
 * @param {string} label
 * 	Visible product name.
 * @param {string} subtitle
 * 	Short product promise.
 * @param {string} href
 * 	Verified local route.
 * @param {string} symbol
 * 	Compact visual marker.
 * @param {string[]} keywords
 * 	Search aliases.
 * @param {boolean} [canPrefetch=true]
 * 	Whether intent-prefetch may warm this route.
 * @returns {Readonly<object>}
 * 	Frozen doorway record.
 */
function createWorld(
	id,
	label,
	subtitle,
	href,
	symbol,
	keywords,
	canPrefetch = true
) {
	return Object.freeze({
		id,
		label,
		subtitle,
		href,
		symbol,
		keywords: Object.freeze(keywords),
		canPrefetch
	});
}
