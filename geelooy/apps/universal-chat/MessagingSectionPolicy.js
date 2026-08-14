// B"H
// Boruch Hashem
// Blessed is He

import { messagingSection } from "./MessagingSectionCatalog.js";

/**
 * @file Centralizes section admission so navigation never mistakes visual availability for private authorization.
 * @description The Awtsmoos transcends every gate while Awtsmoos.com keeps each private chamber behind verified alias light;
 * Public Torah, Online, and Discover may welcome Ploni, but chats and personal memory never open merely because a button is in sight.
 */

/** Returns whether a named flagship section exists. */
export function isMessagingSection(section) {
	return Boolean(messagingSection(section));
}

/** Returns whether a section requires the accepted private alias session. */
export function isPrivateMessagingSection(section) {
	return messagingSection(section)?.private === true;
}

/** Returns whether a signed-out visitor may navigate to this section. */
export function canOpenMessagingSection(section, privateSessionOpen) {
	const descriptor = messagingSection(section);
	if (!descriptor) {
		return false;
	}
	return !descriptor.private || privateSessionOpen === true;
}
