// B"H
// Boruch Hashem
// Blessed is He

import { messagingNewActionPresentation } from "./MessagingNewActionPresentation.js";
import { MessagingSectionActions } from "./MessagingSectionActions.js";
import { MessagingWorkspaceSections } from "./MessagingWorkspaceSections.js";

/**
 * @file Routes flagship sections while each list receives a truthful section-specific creation doorway instead of one ambiguous New button.
 * @description The Awtsmoos is one before every section, yet Awtsmoos.com lets each chamber keep its finite task in light;
 * navigation may close a thread by choice, background refresh never tears a living conversation from sight, and the creation doorway names chat, group, or friendship before consent is requested.
 */

const LIST_SECTIONS = new Set(["chats", "groups", "requests", "friends"]);

/** Coordinates section navigation without owning transport, persistence, or specialized rendering. */
export class MessagingSectionController {
	constructor(options) {
		Object.assign(this, options);
		this.current = "chats";
		this.actions = new MessagingSectionActions({
			modal: options.modal,
			network: options.network,
			status: options.status
		});
		this.workspace = new MessagingWorkspaceSections({
			shell: this.shell,
			store: this.store,
			special: this.special,
			activity: options.activity,
			discovery: options.discovery,
			presence: options.presence,
			mobile: options.mobile,
			actions: this.actions
		});
	}

	/** Performs explicit navigation, closing only the previous human-selected thread before revealing the new chamber. */
	async show(section) {
		this.current = section;
		this.shell.selectSection(section);
		this.conversation.close();
		if (this.workspace.owns(section)) {
			await this.workspace.show(section);
			this.search.refresh();
			return;
		}
		this.mobile.showList();
		this.renderList(section);
		this.search.refresh();
	}

	/** Redraws only the current compact list without closing an already-open conversation. */
	refreshList() {
		if (!LIST_SECTIONS.has(this.current)) return;
		this.renderList(this.current);
		this.search.refresh();
	}

	renderList(section) {
		this.shell.elements.list.hidden = false;
		this.shell.elements.special.hidden = true;
		this.configureNewAction(section);
		if (section === "chats") {
			this.list.renderConversations(this.store.conversations, "direct");
			return;
		}
		if (section === "groups") {
			this.list.renderConversations(this.store.conversations, "group");
			return;
		}
		if (section === "requests") {
			this.list.renderRequests(this.store.requests);
			return;
		}
		this.list.renderFriends(this.store.relationships);
	}

	/** Keeps desktop text, phone icon semantics, title, and visibility synchronized with the current private task. */
	configureNewAction(section) {
		const presentation = messagingNewActionPresentation(section);
		const button = this.shell.elements.newAction;
		button.hidden = !presentation;
		if (!presentation) return;
		button.setAttribute("aria-label", presentation.ariaLabel);
		button.title = presentation.ariaLabel;
		const copy = button.querySelector("span:last-child");
		if (copy) copy.textContent = presentation.buttonLabel;
	}

	/** Delegates the current section's creation action through consent-aware private mutation APIs. */
	async newAction() {
		const changed = await this.actions.create(this.current);
		if (changed) this.refreshList();
	}
}
