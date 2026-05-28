/**
 * B"H
 * @module CommentFetchingEngine
 * @description
 * Sidebar discovery follows the same covenant as inline placement: only a real
 * `dayuh.subSection` makes a note paragraph-specific. Notes without it still
 * count for the focused verse because they gather at verse end.
 */

import { getCommentsByAlias, getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../logic/unroller.js";
import { data, getInlineAliases } from "../state.js";

function normalizeDayuh(raw) {
    if (!raw) return {};
    if (typeof raw === "string") {
        try { return JSON.parse(raw) || {}; } catch { return {}; }
    }
    return typeof raw === "object" ? raw : {};
}

function mainSub(sub) {
    return sub === undefined || sub === null || sub === "" || sub === "main" || sub === "root";
}

function uniqueAliases(items) {
    return Array.from(new Set((items || []).filter(Boolean).map(String)));
}

function scopedAliasSeeds(verseAliases = []) {
    return uniqueAliases([...verseAliases, ...getInlineAliases()]);
}

async function fetchVerseAliases(verseSection, forceFresh) {
    const cacheKey = `${verseSection}-verse-all`;
    if (!forceFresh && data.aliases?.[cacheKey]) return data.aliases[cacheKey].aliases;

    try {
        const result = await getCommentsByAlias({
            seriesId: window.post.parentSeriesId,
            postId: window.post.id,
            heichelId: window.post.heichel.id,
            fromCache: !forceFresh,
            get: { verseSection, map: true }
        });
        const aliases = unrollApiResponse(result);
        if (Array.isArray(aliases)) {
            if (!data.aliases) data.aliases = {};
            data.aliases[cacheKey] = { aliases, lastModified: Date.now() };
            return aliases;
        }
    } catch (error) {
        if (window.__awtsmoosInlineDebug) console.error("B\"H - Spatial logic rupture:", error);
    }
    return [];
}

export async function getAndSaveAliases(full = false, forceFresh = false, forcedIdx = null, forcedSub = undefined) {
    if (!window.post || !window.post.heichel) return [];

    const params = new URLSearchParams(location.search);
    const verseSection = forcedIdx !== null ? forcedIdx : (params.get("idx") ?? "root");
    let subSection = forcedSub !== undefined ? forcedSub : params.get("sub");
    if (subSection === null || subSection === "null") subSection = undefined;

    const verseAliases = await fetchVerseAliases(verseSection, forceFresh);
    const aliases = scopedAliasSeeds(verseAliases);
    if (subSection === undefined) return aliases;

    const checks = await Promise.all(aliases.map(async aliasId => {
        const relevant = await fetchRelevantComments(aliasId, verseSection, subSection);
        return relevant.length ? aliasId : null;
    }));
    return uniqueAliases(checks);
}

export async function fetchRelevantComments(alias, cv, cs) {
    const result = await getCommentsOfAlias({
        seriesId: window?.post?.parentSeriesId,
        postId: window?.post?.id,
        heichelId: window?.post?.heichel.id,
        aliasId: alias,
        fromCache: true,
        get: { verseSection: cv, map: true }
    });

    const allVerseComments = unrollApiResponse(result);
    if (!Array.isArray(allVerseComments)) return [];

    return allVerseComments.filter(comment => {
        const dayuh = normalizeDayuh(comment.dayuh);
        const cVerse = dayuh.verseSection ?? comment.verseSection ?? cv;
        const cSub = dayuh.subSection;
        if (String(cVerse) !== String(cv)) return false;
        if (cs === null || cs === undefined || cs === "null") return mainSub(cSub);
        return String(cSub) === String(cs) || mainSub(cSub);
    });
}
