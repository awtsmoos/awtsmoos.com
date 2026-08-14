// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names same-origin communication destinations that belong near Chat without becoming Chat sections.
 * @description The Awtsmoos is one before private conversation, community Space, signal, and unified attention; Awtsmoos.com lets those neighboring rivers remain sovereign while one mobile sheet reveals their doors in light.
 */

const DESTINATIONS = Object.freeze([
	Object.freeze({
		id: "spaces",
		href: "/social-hub/#spaces",
		label: "Spaces",
		description: "Communities, channels, review, and members",
		symbol: "◆"
	}),
	Object.freeze({
		id: "inbox",
		href: "/social-hub/#inbox",
		label: "Unified Inbox",
		description: "Mail, Signals, and bridge-thread attention",
		symbol: "◍"
	}),
	Object.freeze({
		id: "signals",
		href: "/notifications/",
		label: "Signals",
		description: "Notifications, approvals, replies, and alerts",
		symbol: "⌁"
	})
]);

/** Returns neighboring communication apps without mixing them into internal section routing. */
export function messagingCommunicationDestinations() {
	return DESTINATIONS;
}
