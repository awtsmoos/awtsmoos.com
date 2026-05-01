
/**
 * B"H
 * @module CommentFetchingEngine
 * @chapter The Seeker in the Dark
 */

import { getCommentsByAlias, getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { unrollApiResponse } from "../logic/unroller.js";

// B"H - ANCHORING TO THE CORRECT STATE AGGREGATOR
import { data } from "../state.js";

/**
 * @function getAndSaveAliases
 * @description Scans the coordinated heavens of the API to find speakers.
 */
export async function getAndSaveAliases(full = false, forceFresh = false, forcedIdx = null, forcedSub = undefined, allowFallback = true) {
    if (!window.post || !window.post.heichel) return [];
    
    const s = new URLSearchParams(location.search);
    const verseSection = forcedIdx !== null ? forcedIdx : (s.get("idx") ?? "root");
    
    let subSection = forcedSub !== undefined ? forcedSub : s.get("sub");
    if(subSection === null || subSection === "null") subSection = undefined; 

    const fetchVerseAliases = async (vs) => {
        const cacheKey = `${vs}-verse-all`;
        if (!forceFresh && data.aliases?.[cacheKey]) {
            return data.aliases[cacheKey].aliases;
        }
        try {
            let result = await getCommentsByAlias({
                seriesId: window.post.parentSeriesId, 
                postId: window.post.id, 
                heichelId: window.post.heichel.id,
                fromCache: !forceFresh, 
                get: { verseSection: vs, map: true } 
            });

            const aliases = unrollApiResponse(result);

            if (Array.isArray(aliases)) {
                if (!data.aliases) data.aliases = {};
                data.aliases[cacheKey] = { aliases: aliases, lastModified: Date.now() };
                return aliases;
            }
        } catch (e) { console.error("B\"H - Spatial logic rupture:", e); }
        return [];
    };

    let verseAliases = await fetchVerseAliases(verseSection);

    if (subSection !== undefined) {
        const checks = await Promise.all(verseAliases.map(async (aliasId) => {
            const relevant = await fetchRelevantComments(aliasId, verseSection, subSection);
            return (relevant.length > 0) ? aliasId : null;
        }));
        return checks.filter(Boolean);
    }

    return verseAliases;
}

/**
 * @function fetchRelevantComments
 * @description Collects the specific gems of insight for an Alias.
 */
export async function fetchRelevantComments(alias, cv, cs) {
    let result = await getCommentsOfAlias({
        seriesId: window?.post?.parentSeriesId, 
        postId: window?.post?.id, 
        heichelId: window?.post?.heichel.id, 
        aliasId: alias,
        fromCache: true, 
        get: { verseSection: cv, map: true }
    });
    
    const allVerseComments = unrollApiResponse(result);

    if (!Array.isArray(allVerseComments)) return [];

    return allVerseComments.filter(c => {
        const cSub = c.dayuh?.subSection;
        if (cs === null || cs === undefined || cs === "null") {
            return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
        } 
        return String(cSub) === String(cs) || (cSub === undefined || cSub === null || cSub === 'main');
    });
}
