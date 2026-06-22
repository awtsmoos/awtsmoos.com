// B"H
/**
 * @module MobileCardData
 * @description
 * Chapter 402: The little card confesses the forest inside the seed.
 *
 * Posts, comments, sections, followers, sub-series: each finite count is only a
 * garment for the One Who speaks it into being. This purifier refuses literal
 * garbage text such as `undefined`, preserves stable ids, and gives series cards
 * the sub-series count they deserved from the beginning.
 */

import { openRecordVessel } from "../../navigator/content-normalizer.js";
import { VoidPurifier } from "../../utils/VoidPurifier.js";

function clean(value, fallback = "") {
    const purified = VoidPurifier.purify(value);
    const text = String(purified || "").trim();
    if (!text || text === "undefined" || text === "null") return fallback;
    return text;
}

function count(value) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") return Object.keys(value).length;
    return Number(value || 0) || 0;
}

function firstPresent(...values) {
    return values.find(value => value !== undefined && value !== null && value !== "");
}

export function normalizeCardData(item, type) {
    const raw = openRecordVessel(type === "post" ? item : (item.prateem || item)) || {};
    const id = firstPresent(raw.id, raw.postId, raw.seriesId, raw.inputId, item.id, item.postId, item.seriesId);
    const title = clean(firstPresent(raw.title, raw.name, id), type === "series" ? "Untitled Series" : "Untitled Post");
    const description = clean(firstPresent(raw.description, raw.content, raw.excerpt), "").slice(0, 190);
    return {
        id,
        type,
        title,
        description,
        thumbnail: firstPresent(raw.thumbnail, raw.cover, raw.image) || "",
        postCount: count(firstPresent(raw.posts, raw.postIds, raw.postsCount, item.posts, item.postsCount)),
        subSeriesCount: count(firstPresent(raw.subSeries, raw.subSeriesIds, raw.subSeriesCount, item.subSeries, item.subSeriesCount)),
        followersCount: count(firstPresent(raw.followers, raw.members, raw.views, item.followersCount)),
        sectionsCount: count(firstPresent(raw.sections, raw.sectionIds, item.sectionsCount)),
        commentsCount: count(firstPresent(raw.comments, raw.commentIds, item.commentsCount)),
        indexInSeries: item.indexInSeries,
        raw
    };
}

export function matchesQuery(item, query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return true;
    return [item.title, item.description, item.type].join(" ").toLowerCase().includes(q);
}
