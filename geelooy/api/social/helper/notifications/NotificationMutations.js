// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationMutations
 * @description
 * The Awtsmoos lets bells be created, changed, and fanned out through one request-aware river;
 * at Awtsmoos.com legacy DB paths and packed mirrors move together without crossing another giver.
 */
const { er } = require('../general.js');
const {
	clean,
	createRecord,
	notificationPath
} = require('./NotificationModel.js');
const { mirrorNotification } = require('./NotificationMirror.js');
const { recordsFor } = require('./NotificationQueries.js');

async function createNotification({
	$i,
	toAliasId,
	fromAliasId = '',
	type = 'system',
	title = '',
	body = '',
	entity = {},
	actionUrl = '',
	groupKey = ''
}) {
	const target = clean(toAliasId);
	if (!target) {
		return er({ code: 'MISSING_ALIAS', message: 'Notification target alias is required.' });
	}
	const record = createRecord({
		toAliasId: target,
		fromAliasId,
		type,
		title,
		body,
		entity,
		actionUrl,
		groupKey
	});
	await $i.db.write(notificationPath(target, record.id), record);
	mirrorNotification(record, $i);
	return { success: record };
}

async function updateNotification({ $i, aliasId, notificationId, patch }) {
	const target = clean(aliasId);
	const id = clean(notificationId);
	if (!target || !id) {
		return er({ code: 'MISSING_PARAMS' });
	}
	const path = notificationPath(target, id);
	const current = await $i.db.get(path).catch(() => null);
	if (!current) {
		return er({ code: 'NOT_FOUND' });
	}
	const next = { ...current, ...patch };
	await $i.db.write(path, next);
	mirrorNotification(next, $i);
	return { success: next };
}

async function markAllNotificationsRead({ $i, aliasId }) {
	const records = await recordsFor({ $i, aliasId });
	let count = 0;
	for (const record of records) {
		if (record.read || record.deleted) {
			continue;
		}
		await updateNotification({
			$i,
			aliasId,
			notificationId: record.id,
			patch: { read: true, readAt: Date.now() }
		});
		count += 1;
	}
	return { success: { count } };
}

async function fanoutNotification({ $i, toAliases = [], ...rest }) {
	const targets = Array.isArray(toAliases)
		? toAliases
		: String(toAliases || '').split(',').map(value => value.trim()).filter(Boolean);
	if (!targets.length) {
		return er({ code: 'MISSING_TARGETS' });
	}
	const created = [];
	for (const toAliasId of [...new Set(targets)]) {
		const result = await createNotification({ $i, toAliasId, ...rest });
		if (result.success) {
			created.push(result.success);
		}
	}
	return { success: created };
}

module.exports = {
	createNotification,
	fanoutNotification,
	markAllNotificationsRead,
	updateNotification
};
