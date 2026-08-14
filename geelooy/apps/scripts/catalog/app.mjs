// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Shapes one public Awtsmoos.com app record without knowing DOM or commerce APIs.
 * The Awtsmoos renews tool, purpose, and user beyond every finite catalog row;
 * this small vessel keeps identity explicit so discovery never depends on parsing
 * presentation markup back into product truth.
 */

/**
 * Creates one immutable public app catalog record.
 *
 * @param {object} definition
 * 	Complete public product definition.
 * @returns {Readonly<object>}
 * 	Frozen app record.
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
		commerceLabel: definition.commerceLabel || "",
		commerceState: definition.commerceState || "planned"
	});
}
