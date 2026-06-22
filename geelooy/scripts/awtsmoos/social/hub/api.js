// B"H
/**
 * @module SocialHubApi
 * @description
 * Chapter 455: The browser receives one unified social river. No v2. No split.
 * Every call in this hub points to `/api/social`, so the user can see and touch
 * the living API surface from one beautiful gate.
 */

async function request(path, options = {}) {
    const response = await fetch(path, options);
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
    return { status: response.status, ok: response.ok && !body?.error && body?.ok !== false, body };
}

function body(data = {}) {
    return { method: "POST", body: new URLSearchParams(data) };
}

export const socialApi = {
    meta: () => request("/api/social/meta"),
    openapi: () => request("/api/social/openapi.json"),
    v2Gone: () => request("/api/v2/social/meta"),
    search: ({ aliases, q }) => request(`/api/social/search?aliases=${encodeURIComponent(aliases)}&q=${encodeURIComponent(q)}&limit=12`),
    feed: ({ aliases, kinds = "" }) => request(`/api/social/feed?aliases=${encodeURIComponent(aliases)}&kinds=${encodeURIComponent(kinds)}&limit=12`),
    trending: ({ aliases }) => request(`/api/social/trending?aliases=${encodeURIComponent(aliases)}&limit=12`),
    events: ({ aliases }) => request(`/api/social/events?aliases=${encodeURIComponent(aliases)}&limit=12`),
    discoverHeichelos: ({ q }) => request(`/api/social/heichelos/discover?q=${encodeURIComponent(q)}&limit=12`),
    profile: alias => request(`/api/social/profiles/${encodeURIComponent(alias)}`),
    activity: alias => request(`/api/social/profiles/${encodeURIComponent(alias)}/activity?limit=12`),
    history: alias => request(`/api/social/profiles/${encodeURIComponent(alias)}/history?limit=12`),
    analytics: alias => request(`/api/social/profiles/${encodeURIComponent(alias)}/analytics`),
    graph: alias => request(`/api/social/profiles/${encodeURIComponent(alias)}/graph?limit=40`),
    recommendations: alias => request(`/api/social/recommendations/${encodeURIComponent(alias)}?limit=12`),
    follows: alias => request(`/api/social/follows/${encodeURIComponent(alias)}?limit=50`),
    followers: alias => request(`/api/social/followers/alias/${encodeURIComponent(alias)}?limit=50`),
    follow: ({ alias, type, id }) => request(`/api/social/follows/${encodeURIComponent(alias)}?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`, { method: "POST" }),
    notifications: alias => request(`/api/social/notifications/${encodeURIComponent(alias)}?includeRead=yes&limit=12`),
    unreadCount: alias => request(`/api/social/notifications/${encodeURIComponent(alias)}/unread/count`),
    notify: ({ alias, fromAliasId, title }) => request(`/api/social/notifications/${encodeURIComponent(alias)}`, body({ fromAliasId, type: "hub", title, body: title, actionUrl: "/social" })),
    keysVerify: apiKey => request(`/api/social/keys/verify?apiKey=${encodeURIComponent(apiKey)}`),
    feedHome: alias => request(`/api/social/feed/home?aliasId=${encodeURIComponent(alias)}&limit=8`),
    feedTrending: () => request("/api/social/feed/trending?limit=8"),
    cacheMiss: () => request("/api/social/cache/get?key=social_hub_missing_probe"),
    migrationDryRun: ({ heichelId, seriesId }) => request(`/api/social/migrations/posts/v2/dryRun?heichelId=${encodeURIComponent(heichelId)}&seriesId=${encodeURIComponent(seriesId)}`),
    submissionSettings: heichelId => request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/settings/submissions`),
    editors: heichelId => request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/editors`),

    liveSubscribe: ({ alias, channel }) => request("/api/social/live/subscribe", body({ aliasId: alias, channel })),
    livePresence: ({ alias, channel }) => request("/api/social/live/presence", body({ aliasId: alias, channel, status: "online" })),
    livePublish: ({ alias, channel, text }) => request("/api/social/live/publish", body({ actor: alias, channel, type: "hub.spark", payload: JSON.stringify({ text }) })),
    liveReplay: ({ channel }) => request(`/api/social/live/replay?channel=${encodeURIComponent(channel)}&limit=12`),
    routeHealth: () => Promise.all(["/api/social/meta", "/api/social/openapi.json", "/api/social/feed/trending?limit=3", "/api/social/heichelos/discover?limit=3"].map(path => request(path).then(result => ({ path, ...result }))))
};
