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
		commerceLabel: commerceLabelFor(definition),
		commerceState: definition.commerceState || "planned",
		supportLabel: definition.supportLabel
			|| "Optional supporter tiers · purchased Perutas"
	});
}

/**
 * Normalizes legacy catalog copy without hiding the fact that core app access is free.
 *
 * @param {object} definition Raw catalog definition.
 * @returns {string} Stable static access label; live pricing hydrates separately.
 */
function commerceLabelFor(definition) {
	if (definition.commerceState === "free" || definition.commerceLabel === "Open tool") {
		return "Free core access";
	}
	return definition.commerceLabel || "";
}
