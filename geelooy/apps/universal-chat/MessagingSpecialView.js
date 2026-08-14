// B"H
// Boruch Hashem
// Blessed is He

import { MessagingDisclosure } from "./MessagingDisclosure.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";
import { createMessagingSignedOutState } from "./MessagingSignedOutState.js";
import {
	requestPolicyRow,
	specialButton,
	specialLink
} from "./MessagingSettingsRows.js";

/**
 * @file Renders sparse flagship chambers with phone-first hierarchy: primary actions and privacy choices stay visible while secondary explanation folds into native disclosure.
 * @description The Awtsmoos joins Mail, request boundaries, and quiet special rooms without confusion; Awtsmoos.com keeps the human decision in immediate light,
 * lets architecture and nuance contract when glass is narrow, and never mistakes a collapsed explanation for a collapsed permission or hidden consent state.
 */

export class MessagingSpecialView {
	constructor(container) {
		this.container = container;
	}

	showSignedOut(section) {
		this.container.replaceChildren(createMessagingSignedOutState(section));
	}

	showMail(actions) {
		this.container.replaceChildren();
		const card = panel(
			"Mail",
			"Awtsmoos Mail",
			"Open Mail directly or request email contact from an alias."
		);
		card.append(
			specialActions(
				specialLink("Open Mail", "/email/"),
				specialButton("Request email contact", actions.requestMail)
			),
			explanationDisclosure(
				"mail-boundary",
				"How Mail stays separate",
				"Mail remains the canonical email system. A social contact request can hand you into Mail after acceptance without copying email bodies into chat."
			)
		);
		this.container.appendChild(card);
	}

	showFriendSettings(settings, onChange) {
		this.container.replaceChildren();
		const card = panel(
			"Privacy",
			"Who may contact me?",
			"Choose who may send each kind of private request. Blocking always overrides these choices."
		);
		card.appendChild(explanationDisclosure(
			"request-boundaries",
			"How these boundaries work",
			"Chat, whispers, friendship, group invitations, and Mail contact are separate requests. Friendship never silently opens private chat, and public follows remain separate from private friendship."
		));
		const policies = settings?.allowRequests || {};
		const list = document.createElement("div");
		list.className = "messaging-settings-list";
		for (const kind of ["chat", "whisper", "friend", "group-invite", "mail"]) {
			list.appendChild(requestPolicyRow(kind, policies[kind], onChange));
		}
		card.appendChild(list);
		this.container.appendChild(card);
	}

	showPanel(title, copy) {
		this.container.replaceChildren(createMessagingEmptyState({
			icon: "spark",
			title,
			body: copy
		}));
	}
}

function panel(eyebrowText, titleText, bodyText) {
	const card = document.createElement("section");
	card.className = "messaging-special-card";
	const eyebrow = document.createElement("span");
	eyebrow.className = "messaging-card-eyebrow";
	eyebrow.textContent = eyebrowText;
	const title = document.createElement("h2");
	title.textContent = titleText;
	const body = document.createElement("p");
	body.className = "messaging-special-lead";
	body.textContent = bodyText;
	card.append(eyebrow, title, body);
	return card;
}

function specialActions(...nodes) {
	const row = document.createElement("div");
	row.className = "messaging-special-actions";
	row.append(...nodes);
	return row;
}

function explanationDisclosure(id, title, copy) {
	const body = document.createElement("p");
	body.className = "messaging-special-explanation";
	body.textContent = copy;
	return new MessagingDisclosure({
		id,
		title,
		summary: "Details & privacy",
		className: "messaging-special-disclosure",
		content: body
	}).create();
}
