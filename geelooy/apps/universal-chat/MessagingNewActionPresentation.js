// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names each section's New doorway in human language while preserving the consent meaning of the private protocol beneath it.
 * @description The Awtsmoos is one before chat, friendship, and group, while Awtsmoos.com refuses to let one vague plus sign blur three different covenants in light;
 * every visible label, accessible name, modal promise, and completion message therefore says what the human is actually requesting without pretending consent has already been granted.
 */

const ACTIONS = Object.freeze({
	chats: Object.freeze({
		buttonLabel: "New chat",
		ariaLabel: "Request a private chat",
		title: "Request a private chat",
		description: "Enter an alias to send a chat request. Private messages stay closed until that person accepts.",
		label: "Alias to request",
		placeholder: "Alias",
		submitLabel: "Send chat request",
		kind: "chat"
	}),
	friends: Object.freeze({
		buttonLabel: "Add friend",
		ariaLabel: "Send a friend request",
		title: "Send a friend request",
		description: "Enter an alias to request a mutual private friendship. Friendship does not automatically open a chat.",
		label: "Alias to add",
		placeholder: "Alias",
		submitLabel: "Send friend request",
		kind: "friend"
	}),
	groups: Object.freeze({
		buttonLabel: "New group",
		ariaLabel: "Create a private group",
		title: "Create a private group",
		description: "Create the room first. People join only after you invite them and they accept.",
		label: "Group name",
		placeholder: "Group name",
		submitLabel: "Create group",
		kind: "group"
	})
});

/** Returns the immutable human-facing New action for one section, or null where no New doorway belongs. */
export function messagingNewActionPresentation(section) {
	return ACTIONS[section] || null;
}

/** Returns a completion message that never implies an unaccepted private relationship already exists. */
export function messagingNewActionStatus(section, value) {
	if (section === "chats") {
		return `Chat request sent to ${value}. Private messaging opens after acceptance.`;
	}
	if (section === "friends") {
		return `Friend request sent to ${value}. A chat still requires its own accepted request.`;
	}
	if (section === "groups") {
		return `Created ${value}. Invite people from the group details; each person chooses whether to join.`;
	}
	return "";
}
