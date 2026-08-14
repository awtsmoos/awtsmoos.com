// B"H
// Boruch Hashem
// Blessed is He

import { composeMessagingApp } from "./MessagingAppComposition.js";
import { MessagingMobileMoreMenu } from "./MessagingMobileMoreMenu.js";
import {
	canOpenMessagingSection,
	isMessagingSection,
	isPrivateMessagingSection
} from "./MessagingSectionPolicy.js";

/**
 * @file Owns top-level flagship navigation while authorization policy, rendering, mobile secondary navigation, and store refresh stay delegated.
 * @description The Awtsmoos is present in public and private without confusing their gates, and Awtsmoos.com tells Ploni the truth in light;
 * a phone sheet or account doorway may offer more paths, but every private chamber still returns here before private memory or speech may enter sight.
 */

/** Coordinates rail and More-sheet navigation around the already-mounted shared public/private social bridge. */
export class MessagingAppController {
	constructor(shell, bridge) {
		this.shell = shell;
		this.bridge = bridge;
		this.store = bridge.store;
		this.parts = composeMessagingApp(
			shell,
			bridge,
			(message) => this.setStatus(message)
		);
		this.mobileMore = new MessagingMobileMoreMenu({
			root: shell.root,
			button: shell.elements.mobileMoreButton,
			host: shell.elements.mobileMoreHost,
			onSection: (section) => this.openSection(section)
				.catch((error) => this.setStatus(error?.message))
		});
		this.bindUi();
		this.bindSession();
		this.parts.storeRefresh.start();
	}

	/** Starts the verified private session opportunistically, then reveals the requested lawful section. */
	async start() {
		await this.bridge.session.start().catch(() => false);
		const requested = new URL(location.href).searchParams.get("section");
		const section = isMessagingSection(requested)
			? requested
			: this.bridge.session.opened
				? "chats"
				: "public";
		await this.openSection(section);
	}

	/** Binds persistent rail navigation and the current section's consent-aware New action. */
	bindUi() {
		this.shell.elements.rail.addEventListener("click", (event) => {
			const button = event.target.closest("[data-section]");
			if (!button) return;
			this.openSection(button.dataset.section)
				.catch((error) => this.setStatus(error?.message));
		});
		this.shell.elements.newAction.addEventListener("click", () => {
			this.parts.sections.newAction()
				.catch((error) => this.setStatus(error?.message));
		});
	}

	/** Reacts only to session-boundary changes; list redraws never tear a living conversation from sight. */
	bindSession() {
		this.store.addEventListener("change", (event) => {
			if (event.detail?.kind !== "session") return;
			const section = this.parts.sections.current;
			if (!this.bridge.session.opened && isPrivateMessagingSection(section)) {
				this.showSignedOut(section);
			}
		});
	}

	async openSection(section) {
		if (!isMessagingSection(section)) return;
		if (!canOpenMessagingSection(section, this.bridge.session.opened)) {
			this.showSignedOut(section);
			return;
		}
		await this.parts.sections.show(section);
	}

	/** Shows canonical account-and-alias guidance while leaving public sections available in the same flagship shell. */
	showSignedOut(section) {
		this.parts.sections.current = section;
		this.shell.selectSection(section);
		this.parts.conversation.close();
		this.shell.elements.list.hidden = true;
		this.shell.elements.newAction.hidden = true;
		this.shell.elements.special.hidden = false;
		this.parts.ambient.mobile.showSpecial();
		this.parts.special.showSignedOut(section);
	}

	setStatus(message) {
		this.shell.elements.status.textContent = String(message || "");
	}
}
