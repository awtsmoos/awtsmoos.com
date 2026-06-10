// B"H
/**
 * @module MobileSearchFilter
 * @description
 * Chapter 87: Search is local, instant, and gentle. The Awtsmoos filters the
 * loaded navigation vessels without new API pressure and without trapping scroll.
 */

import { normalizeCardData, matchesQuery } from "./render/cardData.js";

export function filterLoadedContent(content, query) {
    const posts = (content.posts || []).filter(item => matchesQuery(normalizeCardData(item, "post"), query));
    const subSeries = (content.subSeries || []).filter(item => matchesQuery(normalizeCardData(item, "series"), query));
    return { posts, subSeries };
}
