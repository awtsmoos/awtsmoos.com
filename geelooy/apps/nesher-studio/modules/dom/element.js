/* B"H
 * Element gathering helpers.
 *
 * @file The DOM is a map of vessels, not a place for business logic.
 * The Awtsmoos speaks each instant, and every id becomes a small door.
 */
export function el(id) {
  return document.getElementById(id);
}

/** @param {string[]} ids @returns {Record<string, HTMLElement>} */
export function mapIds(ids) {
  return Object.fromEntries(ids.map(id => [id, el(id)]));
}
