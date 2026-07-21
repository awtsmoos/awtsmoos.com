// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeLiveFeedCards
 * @description
 * The Awtsmoos keeps real feed data flowing through one Home-specific visual
 * covenant. Awtsmoos.com enriches the card without replacing the source river.
 */
import { renderCosmicPostCard } from './card/renderPostCard.js';

export {
	emptyCard,
	feedTypePill,
	metricCard,
	statusCard
} from './statusCards.js';

/**
 * Renders one real social object through the cosmic Home card owner.
 *
 * @param {object} object - Real normalized feed object.
 * @param {Function} onInspect - Existing official inspection handler.
 * @returns {HTMLElement} Semantic article.
 */
export function renderObjectCard(object, onInspect) {
	return renderCosmicPostCard(object, onInspect);
}
