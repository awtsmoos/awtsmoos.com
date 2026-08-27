//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Immutable Awtsmoos Apps catalog record factory.
 * @description
 * The Awtsmoos renews tool, purpose, name, and discoverability beyond every finite
 * catalog row. Awtsmoos.com keeps identity explicit so cards, search, tests, and
 * future launchers receive one trustworthy record rather than parsing presentation.
 */
export function defineApp(definition) {
	if (!definition?.id || !definition?.title || !definition?.href) {
		throw new Error("invalid_app_definition");
	}

	return Object.freeze({
		id: definition.id,
		title: definition.title,
		href: definition.href,
		description: definition.description || "",
		icon: definition.icon || "✦",
		chip: definition.chip || "Tool",
		categories: Object.freeze([...(definition.categories || [])]),
		aliases: Object.freeze([...(definition.aliases || [])]),
		commerceLabel: definition.commerceLabel || "",
		commerceState: definition.commerceState || "planned"
	});
}
