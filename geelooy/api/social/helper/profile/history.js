// B"H
/**
 * @module ProfileHistory
 * @description
 * Chapter 417: Memory becomes a private river.
 *
 * A social network is not alive only because others can see your deeds. It is
 * alive because the logged-in traveler can return to the chamber they touched
 * yesterday. This vessel stores recent view history under the alias profile
 * tree, deduplicates by entity, and exposes only the alias-scoped stream.
 */

const { cleanText } = require("./sanitize.js");

function key(aliasId) {
    return `/social/aliases/${aliasId}/history/views`;
}

function normalize(raw = {}) {
    const type = cleanText(raw.type || raw.entityType || "page", 40) || "page";
    const id = cleanText(raw.id || raw.entityId || raw.postId || raw.seriesId || raw.heichelId || raw.url || "unknown", 220);
    return {
        type,
        id,
        title: cleanText(raw.title || raw.name || id, 160),
        url: cleanText(raw.url || "", 400),
        heichelId: cleanText(raw.heichelId || "", 120),
        seriesId: cleanText(raw.seriesId || "", 120),
        postId: cleanText(raw.postId || "", 160),
        viewedAt: Number(raw.viewedAt || raw.timestamp || Date.now()) || Date.now()
    };
}

function dedupe(items, incoming) {
    const sig = item => [item.type, item.id, item.url].join("::");
    const mine = sig(incoming);
    return [incoming, ...items.filter(item => sig(item) !== mine)].slice(0, 200);
}

async function getHistory({ $i, aliasId, limit = 80 }) {
    const items = await $i.db.get(key(aliasId)).catch(() => []);
    return Array.isArray(items) ? items.map(normalize).sort((a, b) => b.viewedAt - a.viewedAt).slice(0, limit) : [];
}

async function recordHistory({ $i, aliasId, input }) {
    const current = await getHistory({ $i, aliasId, limit: 200 });
    const item = normalize(input);
    const next = dedupe(current, item);
    await $i.db.write(key(aliasId), next);
    return { success: item, count: next.length };
}

async function clearHistory({ $i, aliasId }) {
    await $i.db.write(key(aliasId), []);
    return { success: true, aliasId };
}

module.exports = { getHistory, recordHistory, clearHistory };
