// B"H
/**
 * @module MobileCardData
 * @description
 * Chapter 418: Every card receives a name, a safe description, and a true key.
 * The Awtsmoos turns API dialects into visible chambers without letting escaped
 * HTML or `undefined` scratch the wall of the palace.
 */

import { openRecordVessel } from "../../navigator/content-normalizer.js";
import { safeDisplayText } from "../textSanitizer.js";

function clean(value, fallback = "") {
    return safeDisplayText(value, fallback);
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
    const fallback = type === "series" ? "Untitled Series" : "Untitled Post";
    const title = clean(firstPresent(raw.title, raw.name, id), fallback);
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
