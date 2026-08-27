// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationCenter
 * @description
 * The Awtsmoos composes notification queries and mutations without hiding storage ownership;
 * at Awtsmoos.com the public API stays stable while request-local packed mirrors preserve stewardship.
 * Read, archive, delete, fanout, preferences, search, and polling remain one familiar doorway,
 * while focused submodules carry finite details and keep each responsibility from going astray.
 */
const { er } = require('./general.js');
const {
	NOTIFICATION_TYPES,
	clean,
	typeFilter
} = require('./notifications/NotificationModel.js');
const { mirrorNotification } = require('./notifications/NotificationMirror.js');
const {
	getNotificationPreferences,
	updateNotificationPreferences
} = require('./notifications/NotificationPreferences.js');
const {
	listNotifications: queryNotifications,
	pollNotifications: queryPollNotifications
} = require('./notifications/NotificationQueries.js');
const {
	createNotification,
	fanoutNotification,
	markAllNotificationsRead,
	updateNotification
} = require('./notifications/NotificationMutations.js');

async function listNotifications({ $i, aliasId, ...options }) {
	const target = clean(aliasId || $i.$_GET?.aliasId);
	if (!target) {
		return er({ code: 'MISSING_ALIAS', message: 'aliasId is required.' });
	}
	return {
		success: await queryNotifications({
			$i,
			aliasId: target,
			...options
		})
	};
}

async function markNotificationRead(args) {
	return updateNotification({
		...args,
		patch: { read: true, readAt: Date.now() }
	});
}

async function archiveNotification(args) {
	return updateNotification({
		...args,
		patch: { archived: true, archivedAt: Date.now() }
	});
}

async function deleteNotification(args) {
	return updateNotification({
		...args,
		patch: { deleted: true, deletedAt: Date.now() }
	});
}

async function countUnreadNotifications({ $i, aliasId }) {
	const result = await listNotifications({
		$i,
		aliasId,
		includeRead: false
	});
	return result.success
		? { success: { count: result.success.total } }
		: result;
}

async function pollNotifications({ $i, aliasId, since = 0 }) {
	const target = clean(aliasId);
	if (!target) {
		return er({ code: 'MISSING_ALIAS', message: 'aliasId is required.' });
	}
	const result = await queryPollNotifications({ $i, aliasId: target, since });
	return {
		success: result.items,
		cursor: result.cursor,
		hasMore: result.hasMore
	};
}

module.exports = {
	NOTIFICATION_TYPES,
	archiveNotification,
	countUnreadNotifications,
	createNotification,
	deleteNotification,
	fanoutNotification,
	getNotificationPreferences,
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
	mirrorNotification,
	pollNotifications,
	typeFilter,
	updateNotificationPreferences
};
