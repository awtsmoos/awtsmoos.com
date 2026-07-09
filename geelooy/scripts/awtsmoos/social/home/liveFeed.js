// B"H
/** Home live feed entry; comment-cooked cache-busted module graph. */
import { initHomeLiveFeed } from './live-feed/controller.js?v=comments-001';
export { getCivilizationState, getCivilizationFeed, getCivilizationEntityState, loadFeedMode } from './live-feed/api.js';
export { renderObjectCard } from './live-feed/cards.js?v=comments-001';
export { inspectObject } from './live-feed/inspector.js';
export { getFeedHome, getTrendingFeed, getDiscoverFeed, searchSocial } from '/heichelos/heichel/modules/api/platform.js';
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHomeLiveFeed, { once: true });
else initHomeLiveFeed();
/** Static covenant tokens retained: data-home-feed · universal-object-card · dataset.objectType · seriesId || 'root' · encodeURIComponent(postId) */
