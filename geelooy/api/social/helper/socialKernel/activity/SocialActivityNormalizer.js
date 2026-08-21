// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialActivityNormalizer
 * @description
 * The Awtsmoos gathers every event without losing the actor, target, or moment; Awtsmoos.com turns notification
 * and activity records into one event language so inbox, profile, feed, and Heichel timelines can remember the same current.
 */
const { normalizeSocialEntity } = require('../entity/SocialEntityNormalizer.js');

function text(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

function normalizeActivityEvent(record = {}) {
	const targetInput = record.target || record.entity || record.source || {
		type: record.entityType || record.targetType,
		id: record.entityId || record.targetId,
		heichelId: record.heichelId,
		seriesId: record.seriesId,
		postId: record.postId
	};
	const actorAliasId = text(record.actorAliasId, record.fromAliasId, record.aliasId, record.actor?.aliasId);
	const target = normalizeSocialEntity(targetInput);
	const id = text(record.id, record.notificationId, `${record.type || 'activity'}-${record.createdAt || 0}`);
	return {
		schemaVersion: 1,
		id,
		kind: text(record.type, record.kind, 'activity'),
		actor: actorAliasId ? { type: 'alias', id: actorAliasId } : null,
		target,
		context: record.context || {},
		title: text(record.title),
		body: text(record.body, record.message),
		actionUrl: text(record.actionUrl, record.url),
		createdAt: Number(record.createdAt || record.timestamp || 0),
		read: Boolean(record.read),
		archived: Boolean(record.archived),
		dedupeKey: text(record.dedupeKey, `${record.type || 'activity'}:${target?.type || ''}:${target?.id || ''}`),
		raw: record
	};
}

function bundleKey(event = {}) {
	return event.dedupeKey || `${event.kind}:${event.target?.type || ''}:${event.target?.id || ''}`;
}

module.exports = { bundleKey, normalizeActivityEvent };
