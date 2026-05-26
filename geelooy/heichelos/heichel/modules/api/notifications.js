//B"H
/**
 * @module NotificationsAPI
 * @description Browser vessels for durable alias notifications.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

export async function listNotifications({ aliasId, includeRead = false }) {
    const params = new URLSearchParams({ includeRead: includeRead ? 'yes' : 'no' });
    return await AwtsmoosRequest.fetch(`${BASE_API_URL}notifications/${encodeURIComponent(aliasId)}?${params}`);
}

export async function getUnreadNotificationCount({ aliasId }) {
    return await AwtsmoosRequest.fetch(`${BASE_API_URL}notifications/${encodeURIComponent(aliasId)}/unread/count`);
}

export async function markNotificationRead({ aliasId, notificationId }) {
    return await AwtsmoosRequest.post(
        `${BASE_API_URL}notifications/${encodeURIComponent(aliasId)}/${encodeURIComponent(notificationId)}/read`,
        new URLSearchParams({ aliasId, notificationId })
    );
}

export async function createNotification({ toAliasId, fromAliasId, type, title, body, entity = {}, actionUrl = '' }) {
    return await AwtsmoosRequest.post(`${BASE_API_URL}notifications/${encodeURIComponent(toAliasId)}`, new URLSearchParams({
        fromAliasId,
        type,
        title,
        body,
        entity: JSON.stringify(entity),
        actionUrl
    }));
}


export async function pollNotifications({ aliasId, since = 0 }) {
    const params = new URLSearchParams({ since: String(since) });
    return await AwtsmoosRequest.fetch(`${BASE_API_URL}notifications/${encodeURIComponent(aliasId)}/poll?${params}`);
}

export async function fanoutNotifications({ toAliases, fromAliasId, type, title, body, entity = {}, actionUrl = '' }) {
    return await AwtsmoosRequest.post(`${BASE_API_URL}notifications/fanout`, new URLSearchParams({
        toAliases: Array.isArray(toAliases) ? toAliases.join(',') : String(toAliases || ''),
        fromAliasId,
        type,
        title,
        body,
        entity: JSON.stringify(entity),
        actionUrl
    }));
}
