/**
 * B"H
 * @module SparksGatherer
 * @description
 * Summons all inline sparks page-wide. There is no lazy coordinate loading: the
 * BulkLoader fetches every rendered verse for the alias in one eager page pass,
 * then caches that result for the current page.
 */

import {
    clearInlinePageCache,
    loadAllCommentsForAlias
} from "/heichelos/post/comments/logic/inlineManifest/BulkLoader.js";

export class SparksGatherer {
    static async collect(alias, postContext) {
        if (!alias) return [];
        if (postContext) return await loadAllCommentsForAlias(alias, postContext) || [];
        console.warn(`B"H - [SparksGatherer] No post context provided for @${alias}. The void remains.`);
        return [];
    }

    static clearCacheForAlias(alias) {
        clearInlinePageCache(alias);
    }

    static clearAllCache() {
        clearInlinePageCache();
    }
}
