// B"H
/**
 * @module NotificationApi
 * @description Honest JSON requests for Geelooy signals. Each response is read
 * before it is trusted, so a broken river becomes a visible human error.
 */
const API_BASE = '/api/social';

/** Fetches and validates a notification API response. */
export async function notificationApi(path, options = {}) {
	const response = await fetch(`${API_BASE}${path}`, {
		credentials: 'same-origin',
		...options
	});
	const data = await response.json().catch(() => null);
	if (!response.ok || data?.error) {
		const message = data?.error?.message || data?.error || data?.message || response.statusText || 'Notification request failed.';
		throw new Error(String(message));
	}
	return data;
}

/** Returns the account's default alias id when one exists. */
export async function getDefaultAliasId() {
	const data = await notificationApi('/alias/default');
	const value = data?.success ?? data?.data ?? data;
	if (typeof value === 'string') return value;
	return value?.aliasId || value?.id || '';
}

/** Loads one page of notifications for an alias. */
export async function getNotifications(aliasId, query) {
	const data = await notificationApi(`/notifications/${encodeURIComponent(aliasId)}?${query}`);
	return data?.success || data?.data || { items: [], total: 0, hasMore: false };
}

/** Marks one notification as read. */
export function markNotificationRead(aliasId, notificationId) {
	return notificationApi(`/notifications/${encodeURIComponent(aliasId)}/${encodeURIComponent(notificationId)}/read`, { method: 'POST' });
}

/** Marks every notification for an alias as read. */
export function markAllNotificationsRead(aliasId) {
	return notificationApi(`/notifications/${encodeURIComponent(aliasId)}/read/all`, { method: 'POST' });
}
