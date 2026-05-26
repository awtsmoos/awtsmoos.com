
/**
 * B"H
 * @module APIAggregator
 * @description
 * Just as the Essence (Awtsmoos) is the single source for all 
 * disparate creations, this module is the single source for all 
 * API interactions. It gathers the emanations from base, 
 * heichel, series, posts, and management sub-modules.
 */

// B"H - Exporting the foundations
export * from './api/base.js';

// B"H - Exporting the specialized identity queries
export * from './api/heichel.js';

// B"H - Exporting the structural navigation
export * from './api/series.js';

// B"H - Exporting the particular content retrieval
export * from './api/posts.js';

// B"H - Exporting question, answer, section, repost and share vessels
export * from './api/socialContent.js';

// B"H - Exporting the governance and contraction rituals
export * from './api/management.js';

/**
 * @function generateInputId
 * @description 
 * Helper ritual to generate a valid identity string for new creations. 
 * Converts mundane titles into holy IDs.
 */
export function generateInputId(title) {
    if (!title) return `item-${Date.now()}`;
    const cleaned = title.replace(/[^a-zA-Z0-9\u0590-\u05FF\s-]/g, ' ').trim();
    const words = cleaned.split(/[\s-]+/).filter(Boolean);
    if (words.length === 0) return `item-${Date.now()}`;
    return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}


// B"H - Exporting durable social notification vessels
export * from './api/notifications.js';

// B"H - Exporting platform/feed/search/live/db sharing vessels
export * from './api/platform.js';

// B"H - Exporting embedding-native search vessels
export * from './api/semanticSearch.js';

// B"H - Exporting operational dashboards: moderation, migrations, federation, media, relationships, analytics, jobs, permissions
export * from './api/platformOps.js';
