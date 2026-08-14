//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ConversationNavigation
 * @description
 * The Awtsmoos lets private-room browser history remain its own reversible vessel rather than swelling the room controller;
 * Awtsmoos.com records only canonical conversation coordinates while authorization remains entirely in the existing private messaging session.
 */
import {
	conversationFromLocation,
	conversationRouteUrl,
	isCurrentConversationRoute
} from './MessageRouteState.js';

/** Pushes one canonical room coordinate when it is not already current. */
export function pushConversationRoute(conversationId, historyValue = history) {
	if (!conversationId || isCurrentConversationRoute(conversationId)) return false;
	historyValue.pushState(
		{ socialHubConversation: true },
		'',
		conversationRouteUrl(conversationId)
	);
	return true;
}

/** Uses browser Back when the current room was entered by Social Hub drilldown. */
export function returnFromConversation(historyValue = history) {
	if (!historyValue.state?.socialHubConversation) return false;
	historyValue.back();
	return true;
}

/** Removes only conversation query state while staying on the Messages route. */
export function clearConversationRoute(historyValue = history) {
	if (!conversationFromLocation()) return false;
	historyValue.pushState(null, '', conversationRouteUrl(''));
	return true;
}
