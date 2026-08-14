// B"H
// Boruch Hashem
// Blessed is He

import {
	createGroupMemberRow,
	groupActionButton
} from "./MessagingGroupMemberRow.js";

/**
 * @file Renders membership-safe private-group administration while high-friction mutations remain transactional and member management may fold on narrow glass.
 * @description The Awtsmoos is one before invitation, departure, owner, admin, and member; Awtsmoos.com keeps every alias and role visible in light,
 * while invite/leave sheets preserve the human's entered intent through network failure and only server-checked group mutations may change finite membership.
 */

export class MessagingGroupDetails {
	constructor(options) {
		Object.assign(this, options);
		this.current = null;
	}

	set(details) {
		this.current = details;
		this.render();
	}

	clear() {
		this.current = null;
		this.body.replaceChildren();
	}

	render() {
		this.body.replaceChildren();
		if (!this.current) return;
		const { conversation, actor, members } = this.current;
		this.body.append(
			groupHeader(conversation),
			memberSection(conversation, actor, members, this.actions),
			this.footer(conversation, actor)
		);
	}

	footer(conversation, actor) {
		const footer = document.createElement("div");
		footer.className = "messaging-group-footer";
		if (["owner", "admin"].includes(actor?.role)) {
			footer.appendChild(groupActionButton("Invite alias", () => this.invite(conversation)));
		}
		footer.appendChild(groupActionButton("Leave group", () => this.leave(conversation), "danger"));
		return footer;
	}

	async invite(conversation) {
		const alias = await this.modal.perform({
			title: "Invite someone",
			description: "They must accept the invitation before joining this private group.",
			label: "Alias to invite",
			placeholder: "Alias",
			submitLabel: "Send invitation",
			busyLabel: "Sending…"
		}, (value) => this.actions.invite(conversation.id, value));
		if (!alias) return false;
		window.setTimeout(() => this.render(), 0);
		return true;
	}

	async leave(conversation) {
		const confirmation = await this.modal.perform({
			title: "Leave this group?",
			description: "Type LEAVE to confirm. This does not delete other members or their private history.",
			label: "Confirmation",
			placeholder: "LEAVE",
			submitLabel: "Leave group",
			busyLabel: "Leaving…"
		}, async (value) => {
			if (value !== "LEAVE") {
				throw new Error("Type LEAVE exactly to confirm leaving this group.");
			}
			await this.actions.leave(conversation.id);
		});
		return Boolean(confirmation);
	}
}

function groupHeader(conversation) {
	const header = document.createElement("header");
	header.className = "messaging-details-header";
	const title = document.createElement("h2");
	title.textContent = conversation?.title || "Private group";
	const copy = document.createElement("p");
	copy.className = "messaging-details-copy";
	copy.textContent = "Membership is consent-gated. Roles below describe current server-authorized responsibility.";
	header.append(title, copy);
	return header;
}

function memberSection(conversation, actor, members = [], actions) {
	const section = document.createElement("section");
	section.className = "messaging-details-members";
	const heading = document.createElement("h3");
	heading.textContent = `Members · ${members.length}`;
	const list = document.createElement("div");
	for (const member of members) {
		list.appendChild(createGroupMemberRow({
			conversation,
			actor,
			member,
			actorAlias: actor?.alias,
			actions
		}));
	}
	section.append(heading, list);
	return section;
}
