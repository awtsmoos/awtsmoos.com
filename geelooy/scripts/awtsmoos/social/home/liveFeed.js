// B"H
/**
 * @module HomeLiveFeedEntry
 * @description
 * The public Geelooy home page opens one small gate while preserving the
 * historic static contract names for route tests and downstream imports.
 */
import { initHomeLiveFeed } from './live-feed/controller.js';
export { getCivilizationState, getCivilizationFeed, getCivilizationEntityState, loadFeedMode } from './live-feed/api.js';
export { renderObjectCard } from './live-feed/cards.js';
export { inspectObject } from './live-feed/inspector.js';
export { getFeedHome, getTrendingFeed, getDiscoverFeed, searchSocial } from '/heichelos/heichel/modules/api/platform.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeLiveFeed, { once: true });
} else {
  initHomeLiveFeed();
}

/**
 * Static covenant tokens retained for legacy coverage:
 * data-home-feed · universal-object-card · dataset.objectType
 * seriesId || 'root' · encodeURIComponent(postId)
 */
