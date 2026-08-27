// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationModel
 * @description
 * The Awtsmoos gives every bell a bounded name and searchable face;
 * at Awtsmoos.com identity, paths, and text remain one small model space.
 * No persistence lives here, so request-local vessels may choose their rightful shore,
 * while finite notification forms are renewed without binding storage evermore.
 */
const { sp } = require('../_awtsmoos.constants.js');
const { NOTIFICATION_TYPES } = require('./NotificationTypes.js');

let sequence = 0;

function clean(value, fallback = '') {
	return String(value || fallback).trim();
}

function notificationsRoot(aliasId) {
	return `${sp}/aliases/${aliasId}/notifications`;
}

function notificationPath(aliasId, notificationId) {
	return `${notificationsRoot(aliasId)}/${notificationId}`;
}

function preferencesPath(aliasId) {
	return `${sp}/aliases/${aliasId}/notificationPreferences`;
}

function notificationType(value) {
	const candidate = clean(value || 'system');
	return NOTIFICATION_TYPES.includes(candidate) ? candidate : 'system';
}

function typeFilter(value) {
	const candidate = clean(value).toLowerCase();
	return !candidate || ['all', 'any', '*'].includes(candidate)
		? ''
		: notificationType(candidate);
}

function nextId(type) {
	sequence = (sequence + 1) % Number.MAX_SAFE_INTEGER;
	return [
		'BH_note',
		notificationType(type),
		Date.now(),
		process.hrtime.bigint().toString(36),
		sequence.toString(36),
		Math.random().toString(36).slice(2, 8)
	].join('_');
}

function createRecord(values) {
	const type = notificationType(values.type);
	return {
		id: nextId(type),
		type,
		toAliasId: clean(values.toAliasId),
		fromAliasId: clean(values.fromAliasId),
		title: clean(values.title || type),
		body: clean(values.body),
		entity: values.entity && typeof values.entity === 'object' ? values.entity : {},
		actionUrl: clean(values.actionUrl),
		groupKey: clean(values.groupKey),
		read: false,
		archived: false,
		deleted: false,
		createdAt: Date.now(),
		readAt: null,
		archivedAt: null,
		deletedAt: null
	};
}

function searchable(record) {
	return [
		record.id,
		record.type,
		record.title,
		record.body,
		record.actionUrl,
		record.fromAliasId,
		record.groupKey,
		record.entity?.id,
		record.entity?.type,
		record.entity?.title
	].filter(Boolean).join(' ').toLowerCase();
}

module.exports = {
	NOTIFICATION_TYPES,
	clean,
	createRecord,
	notificationPath,
	notificationsRoot,
	preferencesPath,
	searchable,
	typeFilter
};
