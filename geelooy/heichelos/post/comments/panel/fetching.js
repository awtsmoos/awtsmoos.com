/**
 * B"H
 * @module CommentFetchingEngine
 * @description
 * Chapter 211: The sidebar reads the new API directly.
 * No stale helper cache blocks the chamber. Alias discovery and per-alias
 * comments use the named post-comment routes under geelooy/api/social, while
 * unrolling still accepts arrays, maps, success wrappers, and old vessels.
 */

import { unrollApiResponse } from "../logic/unroller.js";
import { data, getInlineAliases } from "../state.js";

function normalizeDayuh(raw) {
    if (!raw) return {};
    if (typeof raw === "string") {
        try { return JSON.parse(raw) || {}; } catch { return {}; }
    }
    return typeof raw === "object" ? raw : {};
}

function mainSub(value) {
    return value === undefined || value === null || value === "" || value === "main" || value === "root";
}

function wholeScroll(value) {
    return value === undefined || value === null || value === "" || value === "root" || value === "all";
}

function uniqueAliases(items) {
    return Array.from(new Set((items || []).filter(Boolean).map(String)));
}

function scopedAliasSeeds(verseAliases = []) {
    return uniqueAliases([...verseAliases, ...getInlineAliases()]);
}

function postApiBase() {
    return `/api/social/heichelos/${window.post.heichel.id}/series/${window.post.parentSeriesId}/post/${window.post.id}/comments`;
}

async function readJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();
    try { return JSON.parse(text); } catch { return text; }
}

function aliasQuery(verseSection) {
    const params = new URLSearchParams();
    if (!wholeScroll(verseSection)) params.set("verseSection", verseSection);
    else params.set("all", "true");
    params.set("_awt", String(Date.now()));
    return params;
}

function commentsQuery(verseSection) {
    const params = aliasQuery(verseSection);
    params.set("map", "true");
    return params;
}

function cacheKeyFor(verseSection) {
    return wholeScroll(verseSection) ? "all-scroll" : `${verseSection}-verse-all`;
}

async function fetchVerseAliases(verseSection, forceFresh) {
    const cacheKey = cacheKeyFor(verseSection);
    if (!forceFresh && data.aliases?.[cacheKey]) return data.aliases[cacheKey].aliases;
    try {
        const url = `${postApiBase()}/aliases?${aliasQuery(verseSection)}`;
        const result = await readJson(url);
        const aliases = unrollApiResponse(result);
        if (Array.isArray(aliases)) {
            if (!data.aliases) data.aliases = {};
            data.aliases[cacheKey] = { aliases, lastModified: Date.now() };
            return aliases;
        }
    } catch (error) {
        if (window.__awtsmoosInlineDebug) console.error("B\"H - Alias fetch rupture:", error);
    }
    return [];
}

export async function getAndSaveAliases(full = false, forceFresh = false, forcedIdx = null, forcedSub = undefined) {
    if (!window.post || !window.post.heichel) return [];
    const params = new URLSearchParams(location.search);
    const verseSection = forcedIdx !== null ? forcedIdx : params.get("idx");
    let subSection = forcedSub !== undefined ? forcedSub : params.get("sub");
    if (subSection === null || subSection === "null") subSection = undefined;
    const verseAliases = await fetchVerseAliases(verseSection, forceFresh);
    const aliases = scopedAliasSeeds(verseAliases);
    if (subSection === undefined || wholeScroll(verseSection)) return aliases;
    const checks = await Promise.all(aliases.map(async aliasId => {
        const relevant = await fetchRelevantComments(aliasId, verseSection, subSection, forceFresh);
        return relevant.length ? aliasId : null;
    }));
    return uniqueAliases(checks);
}

export async function fetchRelevantComments(alias, cv, cs, forceFresh = false) {
    const cacheKey = `${alias}:${cacheKeyFor(cv)}:${cs ?? "all"}`;
    if (!forceFresh && data.commentCache?.[cacheKey]) return data.commentCache[cacheKey];
    const result = await readJson(`${postApiBase()}/aliases/${encodeURIComponent(alias)}?${commentsQuery(cv)}`);
    const allVerseComments = unrollApiResponse(result);
    if (!Array.isArray(allVerseComments)) return [];
    const filtered = wholeScroll(cv) ? allVerseComments : allVerseComments.filter(comment => {
        const dayuh = normalizeDayuh(comment.dayuh);
        const cVerse = dayuh.verseSection ?? comment.verseSection ?? cv;
        const cSub = dayuh.subSection;
        if (String(cVerse) !== String(cv)) return false;
        if (cs === null || cs === undefined || cs === "null") return mainSub(cSub);
        return String(cSub) === String(cs) || mainSub(cSub);
    });
    if (!data.commentCache) data.commentCache = {};
    data.commentCache[cacheKey] = filtered;
    return filtered;
}

export function clearSidebarCommentCache() {
    data.commentCache = {};
    data.aliases = {};
}
