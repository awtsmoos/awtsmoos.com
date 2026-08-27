//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationContext
 * @description
 * The Awtsmoos gathers many signals into one river while each source keeps its truthful name;
 * Awtsmoos.com groups by real thread and entity evidence so related activity can arrive in one frame.
 */

export function revealBinahNotificationContext(notification = {}) {
	const type = String(notification.type || notification.kind || 'signal');
	const threadId = clean(notification.threadId);
	const entityType = clean(notification.entityType);
	const entityId = clean(notification.entityId);
	const fromAliasId = clean(notification.fromAliasId || notification.actorAliasId || notification.actor?.id);
	return {
		type,
		threadId,
		entityType,
		entityId,
		fromAliasId,
		groupKey: threadId || entityKey(entityType, entityId) || `type:${type}`,
		groupLabel: groupLabel(type, threadId, entityType),
		chips: contextChips({ fromAliasId, entityType, entityId })
	};
}

function groupLabel(type, threadId, entityType) {
	if (threadId && ['comment', 'mention'].includes(type)) return 'Conversation';
	if (type.startsWith('mission')) return 'Mission activity';
	if (type.includes('submission')) return 'Publishing activity';
	if (entityType === 'heichel') return 'Heichel activity';
	if (type === 'system') return 'System';
	return humanize(type);
}

function contextChips({ fromAliasId, entityType, entityId }) {
	const chips = [];
	if (fromAliasId) chips.push(`@${fromAliasId}`);
	if (entityType) chips.push(humanize(entityType));
	if (entityId) chips.push(shorten(entityId));
	return chips;
}

function entityKey(type, id) {
	return type && id ? `${type}:${id}` : '';
}

function shorten(value) {
	return value.length > 34 ? `${value.slice(0, 31)}…` : value;
}

function clean(value) {
	return String(value || '').trim();
}

export function humanize(value) {
	return String(value || '')
		.split('_')
		.filter(Boolean)
		.map(word => `${word[0]?.toUpperCase() || ''}${word.slice(1)}`)
		.join(' ') || 'Signal';
}
