// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names flagship chambers, icon language, grouping, privacy, layout, and the small set of destinations worthy of persistent phone navigation.
 * @description The Awtsmoos is one beyond every room, while Awtsmoos.com lets finite thumbs receive only the most useful constant doors in light;
 * every secondary chamber remains fully reachable through More, and mobile prominence never changes privacy, authorization, or workspace ownership.
 */

const SECTIONS = Object.freeze([
	section("chats", "chat", "Chats", "Recent private conversations", "private", true, "list", true),
	section("groups", "groups", "Groups", "Private communities and shared rooms", "private", true, "list", false),
	section("requests", "requests", "Requests", "Consent, invitations, and contact requests", "private", true, "list", true),
	section("friends", "friends", "Friends", "Mutual private relationships", "private", true, "list", false),
	section("public", "book", "Public Torah", "Source-backed Torah discussion", "torah", false, "special", true),
	section("mail", "mail", "Mail", "Awtsmoos Mail and contact handoff", "torah", true, "special", false),
	section("activity", "activity", "Activity", "Your private meaningful history", "personal", true, "special", false),
	section("discover", "discover", "Discover", "Useful Torah and content paths", "personal", false, "special", true),
	section("online", "online", "Online", "Visible presence across Awtsmoos", "personal", false, "special", false),
	section("settings", "settings", "Settings", "Privacy and request boundaries", "personal", true, "special", false)
]);

/** Returns the immutable section catalog used by shell, policy, and workspace routing. */
export function messagingSections() {
	return SECTIONS;
}

/** Finds one known section descriptor without inventing a fallback authorization rule. */
export function messagingSection(id) {
	return SECTIONS.find((item) => item.id === id) || null;
}

/** Returns the secondary chambers that remain reachable through the mobile More sheet. */
export function messagingSecondarySections() {
	return SECTIONS.filter((item) => !item.mobilePrimary);
}

function section(id, icon, label, description, group, privateSection, layout, mobilePrimary) {
	return Object.freeze({
		id,
		icon,
		label,
		description,
		group,
		private: privateSection,
		layout,
		mobilePrimary
	});
}
