// B"H
/**
 * @module ProfileApiClient
 * @description
 * Chapter 63: One fetch covenant pulls the public soul-map from the profile API.
 */

async function json(url, options) {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.error) throw new Error(body?.error?.message || body?.message || response.statusText);
    return body;
}

export function loadProfile(aliasId) {
    return json(`/api/social/profile/${encodeURIComponent(aliasId)}`);
}

export function saveProfile(aliasId, data) {
    return json(`/api/social/alias/${encodeURIComponent(aliasId)}/profile`, { method: "POST", body: new URLSearchParams(data) });
}

export function saveTemplate(aliasId, templateId) {
    return json(`/api/social/alias/${encodeURIComponent(aliasId)}/profile/template`, { method: "POST", body: new URLSearchParams({ templateId }) });
}
