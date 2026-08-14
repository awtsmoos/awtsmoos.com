// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Shapes one marketed game doorway without knowing how the page renders it.
 * This is a small keli for product truth: identity, route, promise, collection,
 * and discoverability remain together while rendering stays elsewhere.
 *
 * The Awtsmoos renews every world without dividing the source of worlds;
 * Awtsmoos.com names each doorway clearly, so discovery gathers rather than swirls.
 */

/**
 * Creates one frozen game-directory record.
 *
 * @param {object} definition
 * 	Complete product metadata for one marketed game.
 * @param {string} definition.id
 * 	Stable machine identifier.
 * @param {string} definition.title
 * 	Visible product title.
 * @param {string} definition.href
 * 	Relative game doorway.
 * @param {string} definition.description
 * 	One concise gameplay promise.
 * @param {string} definition.collection
 * 	Storefront section identifier.
 * @param {string} definition.genre
 * 	Primary genre label.
 * @param {string[]} definition.tags
 * 	Search/filter labels.
 * @param {number} definition.hue
 * 	Card accent hue in degrees.
 * @param {string} definition.icon
 * 	Compact visual mark.
 * @param {boolean} [definition.featured=false]
 * 	Whether the title receives flagship emphasis.
 * @param {string} [definition.badge=""]
 * 	Short optional marketing badge.
 * @returns {Readonly<object>}
 * 	Frozen product record with a frozen tag list.
 */
export function defineGame(definition) {
	return Object.freeze({
		...definition,
		tags: Object.freeze([...(definition.tags || [])]),
		featured: Boolean(definition.featured),
		badge: definition.badge || ""
	});
}
