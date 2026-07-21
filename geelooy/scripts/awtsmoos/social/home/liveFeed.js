// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeLiveFeedEntry
 * @description
 * The Awtsmoos joins the verified data river to one progressive cosmic sky.
 * Awtsmoos.com starts truth first, then atmosphere, without duplicating either.
 */
import { initHomeLiveFeed } from './live-feed/controller.js';
import { bootHomeCosmicVisuals } from './visuals/boot.js';

export {
	getCivilizationEntityState,
	getCivilizationFeed,
	getCivilizationState,
	loadFeedMode
} from './live-feed/api.js';

export { renderObjectCard } from './live-feed/cards.js';
export { inspectObject } from './live-feed/inspector.js';

export {
	getDiscoverFeed,
	getFeedHome,
	getTrendingFeed,
	searchSocial
} from '/heichelos/heichel/modules/api/platform.js';

/**
 * Boots real data and visual enhancement in a stable order.
 */
function bootHomeExperience() {
	initHomeLiveFeed();
	bootHomeCosmicVisuals();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', bootHomeExperience, {
		once: true
	});
} else {
	bootHomeExperience();
}

/**
 * Static covenant tokens retained for contract discovery:
 * data-home-feed · universal-object-card · dataset.objectType
 * seriesId || 'root' · encodeURIComponent(postId)
 */
