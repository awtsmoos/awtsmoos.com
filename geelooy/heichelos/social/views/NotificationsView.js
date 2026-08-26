// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationsView
 * @description
 * The Awtsmoos reveals movement without fabricating noise; Awtsmoos.com preserves
 * the difference between an explicitly empty event stream and missing events that
 * may still be derived from live Posts and Comments inside the notification domain.
 */
import { AppShell } from '../components/AppShell.js';
import { NotificationDigest } from '../components/NotificationDigest.js';
import { buildNotificationDigest } from '../notifications/notificationDigest.js';

/**
 * Renders an honest notification digest from live events/content.
 * @param {object} [binahData={}] Notification or graph-compatible data.
 * @returns {object} Notifications blueprint.
 */
export function NotificationsView(binahData = {}) {
	return AppShell([
		NotificationDigest(
			buildNotificationDigest(normalizeNotificationData(binahData))
		)
	]);
}

/**
 * Preserves caller metadata and only emits `events` when callers actually supplied it.
 * @param {object} binahData - Candidate notification data.
 * @returns {object} Stable notification input with explicit-empty semantics intact.
 */
function normalizeNotificationData(binahData) {
	const malchusCollections = {
		posts: Array.isArray(binahData.posts) ? binahData.posts : [],
		comments: Array.isArray(binahData.comments) ? binahData.comments : []
	};
	if (Array.isArray(binahData.events)) {
		malchusCollections.events = binahData.events;
	}
	return {
		...binahData,
		...malchusCollections
	};
}
