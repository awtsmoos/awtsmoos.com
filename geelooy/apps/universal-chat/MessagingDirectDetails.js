// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders membership-safe direct-conversation details as a relationship panel instead of a raw alias-role dump.
 * @description The Awtsmoos is beyond identity and role while Awtsmoos.com lets an accepted room reveal the people already inside its consent boundary in light;
 * this view adds hierarchy only, never new authority, and never reaches beyond the member-safe conversation details it receives.
 */

/** Replaces one details container with a readable private-relationship summary and member list. */
export function renderDirectDetails(container, conversation) {
	container.replaceChildren();
	const header = document.createElement("header");
	header.className = "messaging-details-header";
	const eyebrow = document.createElement("span");
	eyebrow.className = "messaging-card-eyebrow";
	eyebrow.textContent = "Private relationship";
	const title = document.createElement("h2");
	title.textContent = conversation.title || "Conversation details";
	const copy = document.createElement("p");
	copy.className = "messaging-details-copy";
	copy.textContent = "Only accepted members of this private room are shown here.";
	header.append(eyebrow, title, copy);
	const members = document.createElement("section");
	members.className = "messaging-details-members";
	const memberHeading = document.createElement("h3");
	memberHeading.textContent = `${conversation.members?.length || 0} members`;
	members.appendChild(memberHeading);
	for (const member of conversation.members || []) {
		members.appendChild(memberRow(member));
	}
	container.append(header, members);
}

function memberRow(member) {
	const row = document.createElement("div");
	row.className = "messaging-member-row";
	const avatar = document.createElement("span");
	avatar.className = "messaging-member-avatar";
	avatar.textContent = initials(member.alias);
	const copy = document.createElement("span");
	copy.className = "messaging-member-copy";
	const alias = document.createElement("strong");
	alias.textContent = member.alias || "Alias";
	const role = document.createElement("small");
	role.textContent = roleLabel(member.role);
	copy.append(alias, role);
	row.append(avatar, copy);
	return row;
}

function initials(value) {
	return String(value || "A").trim().split(/\s+/).slice(0, 2)
		.map((part) => part.charAt(0)).join("").toUpperCase() || "A";
}

function roleLabel(value) {
	return value ? `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)}` : "Member";
}
