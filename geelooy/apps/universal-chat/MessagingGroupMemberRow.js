// B"H
// Boruch Hashem
// Blessed is He

import { MessagingDisclosure } from "./MessagingDisclosure.js";

/**
 * @file Builds one membership-safe private-group row whose identity and role stay visible while role-appropriate administration can fold on narrow glass.
 * @description The Awtsmoos is one before owner, admin, member, promotion, removal, or transfer; Awtsmoos.com keeps the person and responsibility in immediate light,
 * while management controls may contract into a native disclosure and every button remains only a request to the existing server-checked group authority.
 */

/** Creates one group member row from already member-safe conversation details. */
export function createGroupMemberRow(options) {
	const { conversation, actor, member, actorAlias, actions } = options;
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
	role.textContent = `${roleLabel(member.role)}${member.alias === actorAlias ? " · You" : ""}`;
	copy.append(alias, role);
	row.append(avatar, copy);
	if (member.alias !== actorAlias) {
		const controls = managementControls(conversation, actor, member, actions);
		if (controls.children.length) {
			row.appendChild(managementDisclosure(member, controls));
		}
	}
	return row;
}

function managementDisclosure(member, controls) {
	return new MessagingDisclosure({
		id: "group-member-management",
		title: "Manage",
		summary: member.alias || "Member",
		className: "messaging-member-management",
		content: controls
	}).create();
}

function managementControls(conversation, actor, member, actions) {
	const controls = document.createElement("div");
	controls.className = "messaging-row-actions";
	if (actor?.role === "owner") {
		controls.append(
			actionButton(
				member.role === "admin" ? "Make member" : "Make admin",
				() => actions.updateGroup(
					conversation.id,
					"role",
					member.alias,
					member.role === "admin" ? "member" : "admin"
				)
			),
			actionButton("Transfer owner", () => actions.updateGroup(
				conversation.id,
				"transfer-owner",
				member.alias
			))
		);
	}
	if (["owner", "admin"].includes(actor?.role) && member.role !== "owner") {
		controls.appendChild(actionButton(
			"Remove",
			() => actions.updateGroup(conversation.id, "remove", member.alias),
			"danger"
		));
	}
	return controls;
}

export function groupActionButton(label, action, variant = "secondary") {
	return actionButton(label, action, variant);
}

function actionButton(label, action, variant = "secondary") {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `messaging-row-action is-${variant}`;
	button.textContent = label;
	button.addEventListener("click", () => {
		Promise.resolve(action()).catch(() => {});
	});
	return button;
}

function initials(value) {
	return String(value || "A").trim().split(/\s+/).slice(0, 2)
		.map((part) => part.charAt(0)).join("").toUpperCase() || "A";
}

function roleLabel(value) {
	const text = String(value || "member");
	return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
