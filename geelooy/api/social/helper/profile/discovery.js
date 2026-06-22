// B"H
/**
 * @module ProfileDiscoveryApi
 * @description
 * Chapter 431: The river is unified. No second Torah of endpoints, no split
 * kingdom of v2 and v1. The canonical gate is `/api/social`; older vessels
 * remain for travelers already walking them, but the living map points here.
 */

const { aggregateProfile, getHistory, recordHistory, clearHistory } = require("./index.js");
const { listFollows, follow, unfollow, followers } = require("./follows.js");
const { csv, filterKinds } = require("./apiTools.js");
const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");

function apiMeta() {
    return {
        version: "social-unified",
        canonicalNamespace: "/api/social",
        legacyNamespaces: ["/api/social/profile/*"],
        features: [
            "structured-errors", "cursor-pagination", "global-search",
            "feed-filtering", "trending", "recommendations",
            "follow-subscriptions", "notifications-bridge", "openapi",
            "bulk", "graph-expansion", "etag-meta", "rate-limit-meta",
            "event-stream-shape", "analytics", "heichel-discovery",
            "cross-alias-activity"
        ],
        canonicalRoutes: [
            "/meta", "/openapi.json", "/profiles/batch", "/profiles/:alias",
            "/profiles/:alias/activity", "/profiles/:alias/analytics",
            "/profiles/:alias/graph", "/profiles/:alias/history", "/search",
            "/feed", "/trending", "/recommendations/:alias", "/follows/:alias",
            "/followers/:type/:id", "/bulk", "/events", "/heichelos/discover"
        ]
    };
}

async function batchProfiles({ $i, aliases = [], query = {} }) {
    const out = [];
    const expand = new Set(csv(query.expand));
    for (const aliasId of aliases.slice(0, 50)) {
        const profile = await aggregateProfile({ $i, aliasId });
        if (!profile) continue;
        if (expand.has("full")) out.push(profile);
        else out.push({
            alias: profile.alias,
            profile: profile.profile,
            stats: profile.stats,
            activity: profile.activity?.slice(0, 8) || [],
            history: expand.has("history") ? profile.history : undefined
        });
    }
    return out;
}

async function profileFeed({ $i, aliases = [], query = {} }) {
    const profiles = await batchProfiles({ $i, aliases, query: { ...query, expand: "full" } });
    const events = profiles.flatMap(profile => (profile.activity || []).map(item => ({ ...item, aliasId: profile.alias.id })));
    return filterKinds(events, csv(query.kind || query.kinds)).sort((a, b) => (b.createdAt || b.time || 0) - (a.createdAt || a.time || 0));
}

async function search({ $i, query = {} }) {
    const q = cleanText(query.q || query.query || "", 120).toLowerCase();
    const aliases = csv(query.aliases);
    const profiles = aliases.length ? await batchProfiles({ $i, aliases, query: { expand: "full" } }) : [];
    const hay = [];
    for (const profile of profiles) {
        hay.push({ type: "alias", id: profile.alias.id, title: profile.profile.displayName, text: profile.profile.bio, source: profile });
        for (const post of profile.posts || []) hay.push({ type: "post", id: post.postId, title: post.title, text: post.excerpt, source: post });
        for (const comment of profile.comments || []) hay.push({ type: "comment", id: comment.id, title: comment.postTitle, text: comment.content, source: comment });
        for (const heichel of profile.heichelos || []) hay.push({ type: "heichel", id: heichel.id, title: heichel.name, text: heichel.description, source: heichel });
    }
    return q ? hay.filter(item => [item.id, item.title, item.text].join(" ").toLowerCase().includes(q)) : hay;
}

async function trending({ $i, query = {} }) {
    const aliases = csv(query.aliases);
    const feed = await profileFeed({ $i, aliases, query });
    return feed.map((item, index) => ({ ...item, trendingScore: 1000 - index + Number(item.source?.commentsCount || 0) + Number(item.source?.sectionsCount || 0) }));
}

async function recommendations({ $i, aliasId, query = {} }) {
    const profile = await aggregateProfile({ $i, aliasId });
    if (!profile) return [];
    const follows = await listFollows({ $i, aliasId });
    const followed = new Set(follows.map(x => `${x.type}:${x.id}`));
    const heichelos = (profile.heichelos || []).filter(h => !followed.has(`heichel:${h.id}`)).map(h => ({ type: "heichel", id: h.id, title: h.name, reason: "You contributed here." }));
    const activity = (profile.activity || []).map(a => ({ type: "activity", id: a.id, title: a.title, reason: "Based on recent activity." }));
    return [...heichelos, ...activity].slice(0, Number(query.limit || 20));
}

async function analytics({ $i, aliasId }) {
    const profile = await aggregateProfile({ $i, aliasId });
    if (!profile) return null;
    return {
        aliasId,
        totals: profile.stats,
        activityCount: profile.activity?.length || 0,
        historyCount: profile.history?.length || 0,
        postsWithSections: (profile.posts || []).reduce((sum, post) => sum + Number(post.sectionsCount || 0), 0),
        topHeichelos: (profile.heichelos || []).slice(0, 10)
    };
}

async function heichelDiscover({ $i, query = {} }) {
    const ids = idList(await read($i, paths.heichelRoot(), {}));
    const q = cleanText(query.q || "", 120).toLowerCase();
    const items = [];
    for (const id of ids.slice(0, 500)) {
        const info = await read($i, paths.heichelInfo(id), {});
        const item = { id, name: cleanText(info.name || id, 120), description: cleanText(info.description || "", 240), author: cleanText(info.author || "", 120) };
        if (!q || [item.id, item.name, item.description, item.author].join(" ").toLowerCase().includes(q)) items.push(item);
    }
    return items;
}

async function graph({ $i, aliasId, query = {} }) {
    const profile = await aggregateProfile({ $i, aliasId });
    if (!profile) return null;
    const nodes = [{ id: `alias:${aliasId}`, type: "alias", label: profile.profile.displayName }];
    const edges = [];
    for (const h of profile.heichelos || []) {
        nodes.push({ id: `heichel:${h.id}`, type: "heichel", label: h.name });
        edges.push({ from: `alias:${aliasId}`, to: `heichel:${h.id}`, kind: h.role || "related" });
    }
    for (const p of (profile.posts || []).slice(0, Number(query.limit || 80))) {
        nodes.push({ id: `post:${p.postId}`, type: "post", label: p.title });
        edges.push({ from: `alias:${aliasId}`, to: `post:${p.postId}`, kind: "authored" });
        if (p.heichelId) edges.push({ from: `post:${p.postId}`, to: `heichel:${p.heichelId}`, kind: "in" });
    }
    return { nodes, edges };
}

async function bulk({ $i, input = {} }) {
    const ops = Array.isArray(input.ops) ? input.ops : JSON.parse(input.ops || "[]");
    const results = [];
    for (const op of ops.slice(0, 50)) {
        if (op.action === "recordHistory") results.push(await recordHistory({ $i, aliasId: op.aliasId, input: op.data || {} }));
        else if (op.action === "clearHistory") results.push(await clearHistory({ $i, aliasId: op.aliasId }));
        else results.push({ error: { code: "UNKNOWN_BULK_ACTION", action: op.action } });
    }
    return results;
}

async function events({ $i, aliases = [], query = {} }) {
    const items = await profileFeed({ $i, aliases, query });
    return { mode: "json-event-stream-shape", retry: 5000, events: items.slice(0, Number(query.limit || 40)).map(item => ({ event: item.kind || item.type || "activity", id: item.id, data: item })) };
}

module.exports = { apiMeta, batchProfiles, profileFeed, search, trending, recommendations, analytics, heichelDiscover, graph, bulk, events, listFollows, follow, unfollow, followers };
