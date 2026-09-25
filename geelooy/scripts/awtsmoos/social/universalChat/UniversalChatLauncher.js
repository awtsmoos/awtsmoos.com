// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders one compact sitewide presence/private-inbox doorway in the shared header or floating fallback.
 * @description The Awtsmoos renews public presence and private unread consent beside one quiet launcher of light;
 * Awtsmoos.com lets finite chrome become visually compact while truthful counts remain explicit to assistive technology.
 */

/** Creates one online-count launcher and listens for private unread/request totals. */
export class UniversalChatLauncher {
	constructor(options = {}) {
		this.onlineCount = 0;
		this.unreadCount = 0;
		this.button = document.createElement("button");
		this.button.type = "button";
		this.button.className = "universal-chat-launcher";
		this.button.dataset.universalChatLauncher = "true";
		this.button.addEventListener("click", options.onOpen);
		window.addEventListener("awtsmoosPrivateMessagingUnread", (event) => {
			this.updateUnread(event.detail?.count || 0);
		});
		this.renderLabel();
		this.mount(options.mount);
	}

	/** Rehomes the one launcher into shared header actions when available, otherwise keeps it floating. */
	mount(target) {
		const headerActions = target || document.querySelector(".g-header-actions");
		this.button.classList.remove(
			"g-header-action",
			"universal-chat-header-launcher",
			"universal-chat-floating-launcher"
		);
		if (headerActions) {
			this.button.classList.add(
				"g-header-action",
				"universal-chat-header-launcher"
			);
			headerActions.prepend(this.button);
			return;
		}
		this.button.classList.add("universal-chat-floating-launcher");
		document.body.appendChild(this.button);
	}

	/** Shows the privacy-aware public unique-person count. */
	updateCount(count) {
		this.onlineCount = Math.max(0, Number(count) || 0);
		this.renderLabel();
	}

	/** Adds accepted-chat unread plus pending-request count without revealing private content. */
	updateUnread(count) {
		this.unreadCount = Math.max(0, Number(count) || 0);
		this.renderLabel();
	}

	/** Reflects transient connectivity without removing the last truthful count. */
	setConnected(connected) {
		this.button.classList.toggle("is-offline", !connected);
	}

	/** Builds the one truthful presence phrase used by both visible and accessible labels. */
	presenceLabel() {
		const privateSuffix = this.unreadCount > 0
			? ` · ${this.unreadCount} private`
			: "";
		return `${this.onlineCount} online${privateSuffix}`;
	}

	/** Renders truthful count text and an accessible action label that survives visual compaction. */
	renderLabel() {
		const presence = this.presenceLabel();
		this.button.textContent = `● ${presence}`;
		this.button.setAttribute(
			"aria-label",
			`Open universal Torah chat · ${presence}`
		);
	}
}
