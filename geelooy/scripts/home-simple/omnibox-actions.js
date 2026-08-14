// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gives each ranked intention a truthful native action, naming worlds, remembered searches, and Torah without disguising one as another.

export function createWorldAction(world, isRecent = false) {
	return {
		id: `world-${world.id}`,
		kind: "world",
		label: world.label,
		description: world.subtitle,
		href: world.href,
		symbol: world.symbol,
		badge: isRecent ? "Recent world" : "World",
		worldId: world.id,
		canPrefetch: world.canPrefetch
	};
}

export function createTorahAction(query, badge, kind = "torah") {
	const normalizedQuery = String(query ?? "").trim();

	return {
		id: `${kind}-${encodeURIComponent(normalizedQuery.toLocaleLowerCase())}`,
		kind,
		label: normalizedQuery,
		description: `Search the living library for “${normalizedQuery}”`,
		href: `/mawgawl/sefarim/?q=${encodeURIComponent(normalizedQuery)}`,
		symbol: "ת",
		badge,
		query: normalizedQuery,
		canPrefetch: false
	};
}
