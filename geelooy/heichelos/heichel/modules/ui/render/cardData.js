// B"H
/**
 * @module MobileCardData
 * @description
 * Chapter 86: Before a reader opens a post, the Awtsmoos compresses each item
 * into a thumb-friendly navigation card: title, description, counts, thumbnail,
 * and stable open coordinate.
 */

import { openRecordVessel } from "../../navigator/content-normalizer.js";
import { VoidPurifier } from "../../utils/VoidPurifier.js";

function clean(value, fallback = "") {
    return VoidPurifier.purify(value) || fallback;
}

function count(value) {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === "object") return Object.keys(value).length;
    return Number(value || 0) || 0;
}

export function normalizeCardData(item, type) {
    const raw = openRecordVessel(type === "post" ? item : (item.prateem || item)) || {};
    const id = raw.id || raw.postId || raw.seriesId || raw.inputId || item.id || item.postId || item.seriesId;
    const title = clean(raw.title || raw.name || id, type === "series" ? "Untitled Series" : "Untitled Post");
    const description = clean(raw.description || raw.content || raw.excerpt || "").slice(0, 170);
    return {
        id,
        type,
        title,
        description,
        thumbnail: raw.thumbnail || raw.cover || raw.image || "",
        postCount: count(raw.posts || raw.postIds || raw.postsCount),
        followersCount: count(raw.followers || raw.members || raw.views),
        sectionsCount: count(raw.sections || raw.sectionIds),
        commentsCount: count(raw.comments || raw.commentIds),
        indexInSeries: item.indexInSeries,
        raw
    };
}

export function matchesQuery(item, query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return true;
    return [item.title, item.description, item.type].join(" ").toLowerCase().includes(q);
}
