// B"H
// Boruch Hashem
// Blessed is He

import {
	actionButton,
	baseRow,
	requestLabel,
	shortTime
} from "./MessagingRowFactory.js";

/**
 * @file Builds consent and friendship rows whose visual hierarchy matches the decision a human is actually making.
 * @description The Awtsmoos is one before request, friend, acceptance, refusal, or boundary; Awtsmoos.com therefore puts the person first,
 * explains the gate second, and keeps affirmative, neutral, and blocking actions visibly distinct without pretending a button itself grants authority.
 */

/** Builds one incoming consent request with human identity first and explicit resolution controls second. */
export function incomingRequestRow(item, resolveRequest) {
	const alias = String(item.fromAlias || "Unknown alias");
	const row = baseRow(alias, requestLabel(item.kind), {
		avatarText: alias,
		metaText: shortTime(item.createdAt)
	});
	row.classList.add("messaging-relationship-row", "is-request");
	row.appendChild(actionGroup([
		actionButton("Accept", () => resolveRequest(item.id, "accept"), "primary"),
		actionButton("Decline", () => resolveRequest(item.id, "decline"), "secondary"),
		actionButton("Block", () => resolveRequest(item.id, "block"), "danger")
	]));
	return row;
}

/** Builds one mutual private friend row without implying that friendship itself authorizes a private conversation. */
export function privateFriendRow(friend, requestChat, blockFriend) {
	const alias = String(friend.alias || "Friend");
	const row = baseRow(alias, "Mutual private friend", {
		avatarText: alias
	});
	row.classList.add("messaging-relationship-row", "is-friend");
	row.appendChild(actionGroup([
		actionButton("Request chat", () => requestChat(alias), "primary"),
		actionButton("Block", () => blockFriend(alias), "danger")
	]));
	return row;
}

function actionGroup(buttons) {
	const actions = document.createElement("div");
	actions.className = "messaging-row-actions";
	actions.append(...buttons);
	return actions;
}
