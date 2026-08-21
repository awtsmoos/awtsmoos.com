//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InboxItemPresentation
 * @description
 * The Awtsmoos is beyond signal, sender, and thread, while Awtsmoos.com lets each finite Inbox record speak in human language without inventing urgency or time;
 * this Hod-like model derives presentation only from fields already carried by the canonical communications river in light.
 */

const KIND_LABELS = Object.freeze({
	bridge: 'Bridge',
	mail: 'Mail',
	notification: 'Signal',
	signal: 'Signal',
	message: 'Message',
	reply: 'Reply',
	request: 'Request'
});

/** Returns a stable human label for one canonical Inbox kind. */
export function inboxKindLabel(kind) {
	const normalized = String(kind || '').trim().toLowerCase();
	return KIND_LABELS[normalized] || normalized || 'Communication';
}

/** Returns the best available source identity without fabricating sender detail. */
export function inboxSourceLabel(item) {
	const source = String(
		item?.fromAliasId
		|| item?.fromAlias
		|| item?.aliasId
		|| item?.source
		|| ''
	).trim();
	return source ? `@${source.replace(/^@/, '')}` : 'Awtsmoos';
}

/** Returns concise thread context only when a trustworthy thread id exists. */
export function inboxThreadLabel(item) {
	const threadId = String(item?.threadId || '').trim();
	return threadId ? `Thread ${threadId}` : '';
}

/** Returns semantic read-state text so unread truth never depends on color alone. */
export function inboxReadLabel(item) {
	return item?.readAt ? 'Read' : 'Unread';
}

/** Returns the most useful primary action language from canonical capabilities. */
export function inboxActionLabel(item) {
	if (item?.threadId) return 'Open thread';
	if (item?.actionUrl) return 'Open';
	return item?.readAt ? 'Review' : 'Mark read';
}
