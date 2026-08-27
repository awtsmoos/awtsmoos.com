// B"H
/**
 * @module ProfileApiTools
 * @description
 * Chapter 426: The API learns to speak with consistent vessels: data, meta,
 * cursors, rate hints, cache hints, and structured errors. Headers may be
 * unavailable in this route layer, so the metadata rides inside the JSON body.
 */

const crypto = require("crypto");

function getQuery($i = {}) {
    return $i.$_GET || $i.query || $i.request?.query || {};
}

function csv(value) {
    return String(value || "").split(",").map(x => x.trim()).filter(Boolean);
}

function number(value, fallback, min = 0, max = 500) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.floor(n)));
}

function cursorToOffset(cursor) {
    if (!cursor) return 0;
    try {
        const raw = Buffer.from(String(cursor), "base64url").toString("utf8");
        const parsed = JSON.parse(raw);
        return number(parsed.offset, 0, 0, 1000000);
    } catch {
        return 0;
    }
}

function offsetToCursor(offset) {
    return Buffer.from(JSON.stringify({ offset })).toString("base64url");
}

function paginate(items = [], query = {}, defaults = {}) {
    const limit = number(query.limit, defaults.limit || 25, 1, defaults.max || 100);
    const offset = cursorToOffset(query.cursor);
    const page = items.slice(offset, offset + limit);
    const nextOffset = offset + page.length;
    return {
        items: page,
        pageInfo: {
            limit,
            cursor: query.cursor || "",
            nextCursor: nextOffset < items.length ? offsetToCursor(nextOffset) : "",
            hasMore: nextOffset < items.length,
            total: items.length
        }
    };
}

function etag(data) {
    return `W/\"${crypto.createHash("sha1").update(JSON.stringify(data)).digest("hex").slice(0, 18)}\"`;
}

function rateLimit(query = {}) {
    return { limit: 600, remaining: 599, resetSeconds: 60, policy: "metadata-only-local-dev", cost: Number(query.cost || 1) || 1 };
}

function ok(data, { query = {}, pageInfo = null, version = "2.0", extra = {} } = {}) {
    return { BH: "B\"H", ok: true, data, success: data, meta: { version, etag: etag(data), cache: { ttlSeconds: 20, scope: "social" }, rateLimit: rateLimit(query), pageInfo, ...extra } };
}

function fail(code, message, details = {}) {
    return { BH: "B\"H", ok: false, error: { code, message, details }, meta: { version: "2.0", rateLimit: rateLimit({}) } };
}

function filterKinds(items = [], kinds = []) {
    if (!kinds.length) return items;
    const wanted = new Set(kinds);
    return items.filter(item => wanted.has(item.kind || item.type || item.contentType));
}

module.exports = { getQuery, csv, number, paginate, ok, fail, filterKinds, etag };
