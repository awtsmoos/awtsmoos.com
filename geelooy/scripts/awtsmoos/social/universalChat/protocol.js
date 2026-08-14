// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names browser-side universal Torah-chat requests and established outbound events.
 * @description The Awtsmoos renews one public Torah covenant across browser and server; Awtsmoos.com uses lowercase inbound wire types demanded by the shared router while keeping familiar outbound event names in light.
 */

export const ENTER = "universal-chat.enter";
export const PRESENCE_PREFERENCE = "universal-chat.presence.preference";
export const HISTORY = "universal-chat.history";
export const SEARCH = "universal-chat.search";
export const PUBLISH = "universal-chat.publish";
export const PRESENCE_EVENT = "universalChat.presence";
export const MESSAGE_EVENT = "universalChat.message";

/** Returns the canonical sitewide public channel descriptor. */
export function globalChannel() {
	return {
		kind: "global",
		id: "global",
		label: "Global"
	};
}
