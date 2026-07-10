// B"H
/** Sidebar fetching: rich API first, imported corpus fallback, all verse comments when no paragraph is selected. */
import { unrollApiResponse } from "../logic/unroller.js";
import { data, getInlineAliases } from "../state.js";
const whole = value => value == null || value === "" || value === "root" || value === "all";
const unique = items => Array.from(new Set((items || []).filter(Boolean).map(String)));
function dayuh(raw) {
    if (!raw) return {};
    if (typeof raw === "string") { try { return JSON.parse(raw) || {}; } catch { return {}; } }
    return typeof raw === "object" ? raw : {};
}
function context() {
    return {
        heichelId:window.post?.heichel?.id || window.heichelId || "ikar",
        seriesId:window.post?.parentSeriesId || window.post?.seriesId || window.series?.id || "root",
        postId:window.post?.id || ""
    };
}
function richBase() {
    const c = context();
    return `/api/social/heichelos/${c.heichelId}/series/${c.seriesId}/post/${c.postId}/comments`;
}
async function readJson(url, timeoutMs=5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { cache:"no-store", signal:controller.signal });
        const text = await response.text();
        try { return JSON.parse(text); } catch { return text; }
    } finally { clearTimeout(timer); }
}
function richQuery(verse) {
    const q = new URLSearchParams({ _awt:String(Date.now()) });
    if (whole(verse)) q.set("all", "true"); else q.set("verseSection", verse);
    return q;
}
function corpusQuery({ aliasId, verse, sub }) {
    const q = new URLSearchParams(context());
    if (aliasId) q.set("aliasId", aliasId);
    if (!whole(verse)) q.set("verseSection", verse);
    if (sub != null && sub !== "null" && sub !== "") q.set("subSection", sub);
    return q;
}
function cacheKey(verse) { return whole(verse) ? "all-scroll" : `${verse}-verse-all`; }
async function corpusAliases(verse) {
    const payload = await readJson(`/api/social/search/rag/post-comments?${corpusQuery({ verse })}`, 20000);
    return unique(unrollApiResponse(payload));
}
async function fetchVerseAliases(verse, fresh) {
    const key = cacheKey(verse);
    if (!fresh && data.aliases?.[key]) return data.aliases[key].aliases;
    let aliases = [];
    try { aliases = unrollApiResponse(await readJson(`${richBase()}/aliases?${richQuery(verse)}`)); } catch (_) {}
    if (!Array.isArray(aliases) || !aliases.length) {
        try { aliases = await corpusAliases(verse); } catch (_) { aliases = []; }
    }
    aliases = unique([...(aliases || []), ...getInlineAliases()]);
    if (!data.aliases) data.aliases = {};
    data.aliases[key] = { aliases, lastModified:Date.now() };
    return aliases;
}
function filterComments(rows, verse, sub) {
    if (whole(verse)) return rows;
    return rows.filter(comment => {
        const meta = dayuh(comment.dayuh);
        const commentVerse = meta.verseSection ?? comment.verseSection ?? verse;
        const commentSub = meta.subSection ?? comment.subsection;
        if (String(commentVerse) !== String(verse)) return false;
        if (sub == null || sub === "null" || sub === "") return true;
        return String(commentSub) === String(sub);
    });
}
async function corpusComments(alias, verse, sub) {
    const payload = await readJson(`/api/social/search/rag/post-comments?${corpusQuery({ aliasId:alias, verse, sub })}`, 30000);
    const rows = unrollApiResponse(payload);
    return Array.isArray(rows) ? rows : [];
}
export async function getAndSaveAliases(full=false, fresh=false, forcedIdx=null, forcedSub=undefined) {
    if (!window.post?.heichel) return [];
    const url = new URLSearchParams(location.search);
    const verse = forcedIdx !== null ? forcedIdx : url.get("idx");
    let sub = forcedSub !== undefined ? forcedSub : url.get("sub");
    if (sub === "null") sub = undefined;
    const aliases = await fetchVerseAliases(verse, fresh);
    if (sub === undefined || whole(verse)) return aliases;
    const checks = await Promise.all(aliases.map(async alias => (await fetchRelevantComments(alias, verse, sub, fresh)).length ? alias : null));
    return unique(checks);
}
export async function fetchRelevantComments(alias, verse, sub, fresh=false) {
    const key = `${alias}:${cacheKey(verse)}:${sub ?? "all"}`;
    if (!fresh && data.commentCache?.[key]) return data.commentCache[key];
    let rows = [];
    try { const q = richQuery(verse); q.set("map", "true"); rows = unrollApiResponse(await readJson(`${richBase()}/aliases/${encodeURIComponent(alias)}?${q}`)); } catch (_) {}
    if (!Array.isArray(rows) || !rows.length) {
        try { rows = await corpusComments(alias, verse, sub); } catch (_) { rows = []; }
    }
    const filtered = filterComments(Array.isArray(rows) ? rows : [], verse, sub);
    if (!data.commentCache) data.commentCache = {};
    data.commentCache[key] = filtered;
    return filtered;
}
export function clearSidebarCommentCache() { data.commentCache = {}; data.aliases = {}; }
