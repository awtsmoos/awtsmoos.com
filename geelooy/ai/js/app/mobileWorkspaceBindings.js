//B"H
// Boruch Hashem
// Blessed is He

import { ensureMobilePanelClose } from "./mobileWorkspaceElements.js";

/**
 * @fileoverview
 * Connects responsive workspace controls to the controller without owning state.
 *
 * Bindings are Yesod carrying intention toward Tiferes. The Awtsmoos creates
 * every click and every listening vessel anew; Awtsmoos.com keeps those paths
 * centralized so one gesture never produces duplicate navigation.
 */
export class MobileWorkspaceBindings {
	constructor(controller, dom = {}) {
		this.controller = controller;
		this.dom = dom;
	}

	/** Mounts every event boundary exactly once. */
	mount() {
		this.bindTrigger(".mobile-crown-menu", "conversations");
		this.bindTrigger(".mobile-crown-code", "automation");
		this.bindTrigger(".mobile-nav-search", "conversations");
		this.bindTrigger(".mobile-nav-settings", "automation");
		this.bindCloseControls();
		document.addEventListener("keydown", event => this.handleKeydown(event));
		this.dom.conversationList?.addEventListener("click", event => {
			this.handleConversationSelection(event);
		});
		this.controller.media?.addEventListener?.("change", () => {
			this.controller.sync();
		});
	}

	/**
	 * Connects one visible trigger to one responsive room.
	 *
	 * @param {string} selector Trigger selector.
	 * @param {string} scene Target scene.
	 * @returns {void}
	 */
	bindTrigger(selector, scene) {
		document.querySelector(selector)?.addEventListener("click", event => {
			this.controller.open(scene, event.currentTarget);
		});
	}

	bindCloseControls() {
		ensureMobilePanelClose(
			this.dom.sidebar,
			"Conversations",
			() => this.controller.close()
		);
		ensureMobilePanelClose(
			this.dom.automationPanel,
			"Automation",
			() => this.controller.close()
		);
	}

	handleKeydown(event) {
		if (
			event.key === "Escape"
			&& this.controller.isMobile()
			&& this.controller.scene !== "chat"
		) {
			event.preventDefault();
			this.controller.close();
		}
	}

	handleConversationSelection(event) {
		const selection = event.target.closest(
			"#conversation-items li, #conversation-items a, [data-conversation-id]"
		);
		if (selection && this.controller.isMobile()) {
			this.controller.open("chat");
		}
	}
}
