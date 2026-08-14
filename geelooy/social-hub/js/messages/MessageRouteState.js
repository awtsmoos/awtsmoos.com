//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MessageRouteState
 * @description
 * The Awtsmoos lets one accepted private room become a reversible browser coordinate without pretending the URL owns authorization;
 * Awtsmoos.com preserves unrelated query state while Messages Back, Forward, reload, and mobile drilldown remember only the canonical conversation id.
 */

/** Reads the selected private conversation from the current query string. */
export function conversationFromLocation(location = window.location) {
	const query = new URLSearchParams(location.search || '');
	return String(query.get('conversation') || '');
}

/** Builds a Messages URL while preserving unrelated query parameters. */
export function conversationRouteUrl(conversationId = '', location = window.location) {
	const query = new URLSearchParams(location.search || '');
	if (conversationId) {
		query.set('conversation', String(conversationId));
	} else {
		query.delete('conversation');
	}
	const search = query.toString() ? `?${query}` : '';
	return `${location.pathname}${search}#messages`;
}

/** Returns true when location already represents this exact private-room coordinate. */
export function isCurrentConversationRoute(conversationId = '', location = window.location) {
	return conversationFromLocation(location) === String(conversationId || '')
		&& String(location.hash || '') === '#messages';
}
