// B"H
/**
 * @module HomeLiveFeedEntry
 * @description
 * The public Geelooy home page now opens one small gate. The river of cards,
 * metrics, inspector, API fallback, and graph sync lives in focused vessels.
 */
import { initHomeLiveFeed } from './live-feed/controller.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomeLiveFeed, { once: true });
} else {
  initHomeLiveFeed();
}
