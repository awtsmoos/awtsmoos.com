//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MessagesModel
 * @description
 * The Awtsmoos lets private summaries remain compact while unread sequence, labels, and dedicated-app navigation stay exact;
 * Awtsmoos.com derives presentation only from accepted private store records and never invents a peer deep link the flagship app does not actually parse.
 */

export function conversationUnread(conversation) {
	return Math.max(
		0,
		Number(conversation?.lastSequence || 0)
			- Number(conversation?.lastReadSequence || 0)
	);
}

export function conversationTitle(conversation) {
	return conversation?.title
		|| conversation?.memberAliases?.join(', ')
		|| 'Private conversation';
}

export function conversationSubtitle(conversation) {
	return conversation?.lastPreview
		|| conversation?.kind
		|| conversation?.memberAliases?.join(' · ')
		|| 'Accepted private room';
}

export function requestAlias(request) {
	return request?.fromAliasId
		|| request?.sourceAlias
		|| request?.requesterAliasId
		|| request?.targetAlias
		|| '';
}

/** Builds only query fields the dedicated messaging app actually consumes. */
export function messagingAppUrl(section = 'chats') {
	const url = new URL('/apps/universal-chat/', 'https://awtsmoos.local');
	url.searchParams.set('section', section);
	return `${url.pathname}${url.search}`;
}
