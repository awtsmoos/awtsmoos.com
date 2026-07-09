// B"H
/**
 * @module MobileSearchFilter
 * @description Search filters timeline, tree, and alternate groupings together.
 */
import { normalizeCardData, matchesQuery } from "./render/cardData.js";
export function filterLoadedContent(content, query) {
  const posts = (content.posts || []).filter(item => matchesQuery(normalizeCardData(item, "post"), query));
  const subSeries = (content.subSeries || []).filter(item => matchesQuery(normalizeCardData(item, "series"), query));
  const groupings = (content.groupings || []).filter(item => matchesQuery(normalizeCardData(item, "series"), query));
  return { posts, subSeries, groupings };
}
