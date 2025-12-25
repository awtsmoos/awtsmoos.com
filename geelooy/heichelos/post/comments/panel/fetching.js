
//B"H
import { getCommentsByAlias, getCommentsOfAlias } from "/scripts/awtsmoos/api/utils.js";
import { data } from "../state.js";

/**
 * Retrieves list of aliases commenting on the current section.
 */
export async function getAndSaveAliases(full = false, forceFresh = false, forcedIdx = null, forcedSub = undefined, allowFallback = true) {
    if (!window.post || !window.post.heichel) return [];
    
    const s = new URLSearchParams(location.search);
    const verseSection = forcedIdx !== null ? forcedIdx : (s.get("idx") ?? "root");
    
    let subSection = forcedSub !== undefined ? forcedSub : s.get("sub");
    if(subSection === null) subSection = undefined; 

    // 1. Fetch ALL aliases for the VERSE
    const fetchVerseAliases = async (vs) => {
        const cacheKey = `${vs}-verse-all`;
        if (!forceFresh && data.aliases?.[cacheKey]) {
            return data.aliases[cacheKey].aliases;
        }
        try {
            const result = await getCommentsByAlias({
                seriesId: window.post.parentSeriesId, 
                postId: window.post.id, 
                heichelId: window.post.heichel.id,
                fromCache: !forceFresh, 
                get: { verseSection: vs, map: true } 
            });
            if (Array.isArray(result)) {
                if (!data.aliases) data.aliases = {};
                data.aliases[cacheKey] = { aliases: result, lastModified: Date.now() };
                return result;
            }
        } catch (e) { console.error("Error fetching aliases:", e); }
        return [];
    };

    let verseAliases = await fetchVerseAliases(verseSection);

    // 2. If a sub-section IS active, filter the verse aliases
    if (subSection !== undefined) {
        const filteredAliases = [];
        const checks = verseAliases.map(async (aliasId) => {
            try {
                const comments = await getCommentsOfAlias({
                    seriesId: window.post.parentSeriesId,
                    postId: window.post.id,
                    heichelId: window.post.heichel.id,
                    aliasId: aliasId,
                    fromCache: true,
                    get: { verseSection: verseSection, map: true }
                });
                
                if (Array.isArray(comments)) {
                    const hasSubComment = comments.some(c => String(c?.dayuh?.subSection) === String(subSection));
                    if (hasSubComment) return aliasId;
                }
            } catch(e) {}
            return null;
        });
        
        const results = await Promise.all(checks);
        const activeInSub = results.filter(Boolean);
        
        if (activeInSub.length > 0) {
            return full ? activeInSub : activeInSub; 
        }
        
        // 3. Fallback
        if (allowFallback) {
            const generalChecks = verseAliases.map(async (aliasId) => {
                 const comments = await getCommentsOfAlias({
                    seriesId: window.post.parentSeriesId, postId: window.post.id, heichelId: window.post.heichel.id,
                    aliasId: aliasId, fromCache: true, get: { verseSection: verseSection, map: true }
                });
                if(Array.isArray(comments)) {
                    const hasGeneral = comments.some(c => 
                        c.dayuh?.subSection === undefined || 
                        c.dayuh?.subSection === null || 
                        c.dayuh?.subSection === 'main' || 
                        c.dayuh?.subSection === 'root'
                    );
                    if(hasGeneral) return aliasId;
                }
                return null;
            });
            const generalAliases = (await Promise.all(generalChecks)).filter(Boolean);
            return full ? generalAliases : generalAliases;
        }
        
        return [];
    }

    return full ? verseAliases : verseAliases;
}

/**
 * Fetches relevant comments for a specific alias based on current verse/sub context.
 */
export async function fetchRelevantComments(alias, cv, cs) {
    const allVerseComments = await getCommentsOfAlias({
        seriesId: window?.post?.parentSeriesId, 
        postId: window?.post?.id, 
        heichelId: window?.post?.heichel.id, 
        aliasId: alias,
        fromCache: true, 
        get: { verseSection: cv, map: true }
    });
    
    if (!Array.isArray(allVerseComments)) return [];

    return allVerseComments.filter(c => {
        const cSub = c.dayuh?.subSection;
        if (cs === null || cs === undefined) {
            return cSub === undefined || cSub === null || cSub === 'main' || cSub === 'root';
        } else {
            return String(cSub) === String(cs);
        }
    });
}
