// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationApi
 * @description
 * The Awtsmoos grants each signal an honest route through the day;
 * Awtsmoos.com can cancel an old read without sending data away.
 */

const API_BASE = '/api/social';

/** Fetches and validates a notification JSON response with optional cancellation. */
export async function notificationApi(path, options = {}) {
	const response = await fetch(`${API_BASE}${path}`, {
		credentials: 'same-origin',
		...options
	});
	const data = await response.json().catch(() => null);
	if (!response.ok || data?.error) {
		const message = data?.error?.message
			|| data?.error || data?.message || response.statusText
			|| 'Notification request failed.';
		throw new Error(String(message));
	}
	return data;
}

/** Retrieves the real account's default alias identifier. */
export async function getDefaultAliasId(options = {}) {
	const data = await notificationApi('/alias/default', options);
	const value = data?.success ?? data?.data ?? data;
	if (typeof value === 'string') return value;
	return value?.aliasId || value?.id || '';
}

/** Reads one page with an AbortSignal when a filter supersedes the request. */
export async function getNotifications(aliasId, query, options = {}) {
	const route = `/notifications/${encodeURIComponent(aliasId)}?${query}`;
	const data = await notificationApi(route, options);
	return data?.success || data?.data || { items: [], total: 0, hasMore: false };
}

/** Changes one existing signal only after an explicit user action. */
export function markNotificationRead(aliasId, notificationId) {
	return notificationApi(
		`/notifications/${encodeURIComponent(aliasId)}/${encodeURIComponent(notificationId)}/read`,
		{ method: 'POST' }
	);
}

/** Marks all notifications as read through the existing verified endpoint. */
export function markAllNotificationsRead(aliasId) {
	return notificationApi(`/notifications/${encodeURIComponent(aliasId)}/read/all`, {
		method: 'POST'
	});
}
