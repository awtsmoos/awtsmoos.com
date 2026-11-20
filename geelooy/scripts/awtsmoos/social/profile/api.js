// B"H
/**
 * @module ProfileApiClient
 * @description
 * Chapter 437: The profile client keeps the aggregate profile covenant while
 * still shaping every graph, history, and follow river into one UI vessel.
 */

function unwrap(body) {
    if (body && body.ok && Object.prototype.hasOwnProperty.call(body, "data")) return body.data;
    if (body && Object.prototype.hasOwnProperty.call(body, "success")) return body.success;
    return body;
}

// B"H 2026-11-20 (profile data-layer fix): this fetch had NO timeout,
// so when the profile aggregate was slow (measured 55.6s under load)
// the alias page sat on "Loading profile light..." until the proxy
// gave up — an unbounded hang from the visitor's side. GETs now abort
// at 30s and retry once (a stalled first attempt is the common case
// when the server is shedding load); the worst case is bounded and
// lands on hydrate.js's "Profile unavailable" state instead of
// spinning forever.
const REQUEST_TIMEOUT_MS = 30000;

async function fetchOnce(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, { ...(options || {}), signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function json(url, options) {
    const isGet = !options || !options.method || String(options.method).toUpperCase() === "GET";
    let response;
    try {
        response = await fetchOnce(url, options);
    } catch (error) {
        if (!isGet) throw error;
        response = await fetchOnce(url, options);
    }
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.error) {
        throw new Error(body?.error?.message || body?.message || response.statusText);
    }
    return unwrap(body);
}

function form(data = {}) {
    return { method: "POST", body: new URLSearchParams(data) };
}

export function loadProfile(aliasId) {
    return json(`/api/social/profile/${encodeURIComponent(aliasId)}`);
}

export function loadActivity(aliasId, cursor = "") {
    const suffix = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return json(`/api/social/profiles/${encodeURIComponent(aliasId)}/activity${suffix}`);
}

export function loadHistory(aliasId, cursor = "") {
    const suffix = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return json(`/api/social/profiles/${encodeURIComponent(aliasId)}/history${suffix}`);
}

export function recordHistory(aliasId, data) {
    return json(`/api/social/profiles/${encodeURIComponent(aliasId)}/history`, form(data));
}

export function clearHistory(aliasId) {
    return json(`/api/social/profiles/${encodeURIComponent(aliasId)}/history`, { method: "DELETE", body: new URLSearchParams({ aliasId }) });
}

export function loadGraph(aliasId) {
    return json(`/api/social/profiles/${encodeURIComponent(aliasId)}/graph?limit=40`);
}

export function loadRecommendations(aliasId) {
    return json(`/api/social/recommendations/${encodeURIComponent(aliasId)}?limit=12`);
}

export function listFollows(aliasId) {
    return json(`/api/social/follows/${encodeURIComponent(aliasId)}?limit=200`);
}

export function listFollowers(type, id) {
    return json(`/api/social/followers/${encodeURIComponent(type)}/${encodeURIComponent(id)}?limit=200`);
}

export function followEntity(aliasId, type, id) {
    return json(`/api/social/follows/${encodeURIComponent(aliasId)}`, form({ type, id }));
}

export function unfollowEntity(aliasId, type, id) {
    return json(`/api/social/follows/${encodeURIComponent(aliasId)}`, { method: "DELETE", body: new URLSearchParams({ type, id }) });
}

export function saveProfile(aliasId, data) {
    return json(`/api/social/alias/${encodeURIComponent(aliasId)}/profile`, form(data));
}

export function saveTemplate(aliasId, templateId) {
    return json(`/api/social/alias/${encodeURIComponent(aliasId)}/profile/template`, form({ templateId }));
}
