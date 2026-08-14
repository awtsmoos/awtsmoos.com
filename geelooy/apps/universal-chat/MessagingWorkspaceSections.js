// B"H
// Boruch Hashem
// Blessed is He

import {
	mountUniversalChat
} from "/scripts/awtsmoos/social/universalChat/bootstrap.js";

/**
 * @file Routes non-list flagship chambers while preserving each subsystem's existing authority and one shared transport.
 * @description The Awtsmoos joins Torah, Mail, memory, discovery, presence, and boundaries in one source of light;
 * Awtsmoos.com gives special chambers one mobile back path while their data owners remain distinct and permissions stay bright.
 */

const WORKSPACE_SECTIONS = new Set([
	"public",
	"mail",
	"activity",
	"discover",
	"online",
	"settings"
]);

/** Delegates special workspace sections to their existing or newly focused views. */
export class MessagingWorkspaceSections {
	constructor(options) {
		Object.assign(this, options);
	}

	owns(section) {
		return WORKSPACE_SECTIONS.has(section);
	}

	async show(section) {
		this.presence.deactivate();
		this.prepare();
		this.mobile.showSpecial();
		if (section === "public") {
			return this.publicTorah();
		}
		if (section === "mail") {
			return this.special.showMail({ requestMail: () => this.actions.requestMail() });
		}
		if (section === "activity") {
			return this.activity.show();
		}
		if (section === "discover") {
			return this.discovery.show();
		}
		if (section === "online") {
			return this.presence.show();
		}
		this.special.showFriendSettings(
			this.store.relationships.settings,
			(kind, value) => this.actions.savePolicy(kind, value)
		);
	}

	prepare() {
		this.shell.elements.list.hidden = true;
		this.shell.elements.newAction.hidden = true;
		this.shell.elements.threadHeader.hidden = false;
		this.shell.elements.thread.hidden = true;
		this.shell.elements.composer.hidden = true;
		this.shell.elements.loadOlder.hidden = true;
		this.shell.elements.details.hidden = true;
		this.shell.elements.threadTitle.textContent = this.shell.elements.sectionTitle.textContent;
		this.shell.elements.threadSubtitle.textContent = "One Awtsmoos social-learning workspace";
		this.shell.elements.special.hidden = false;
		this.shell.elements.special.replaceChildren();
	}

	publicTorah() {
		mountUniversalChat({
			expanded: true,
			container: this.shell.elements.special
		});
	}
}
