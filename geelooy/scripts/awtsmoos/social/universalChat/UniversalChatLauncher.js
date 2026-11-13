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
		// B"H - never silently dead: with no opener (or a throwing one) the
		// click used to do nothing. Fall back to the public chat app.
		const open = () => {
			try {
				if (typeof options.onOpen === "function") { options.onOpen(); return; }
			} catch (error) { console.error("B\"H - Universal chat opener failed.", error); }
			window.open("/apps/universal-chat/", "_blank", "noopener");
		};
		// B"H social fix 22 (defect 2): the Fix 21 rendered check proved
		// the click retargets between pointerdown and pointerup —
		// pointerdown/mousedown reach this button, but pointerup/mouseup/
		// click are delivered to <html> even at scroll 0, so the click
		// handler never fires and the chat never opens. No pointer
		// capture, re-render, or retargeting code exists in the served
		// shell (7th investigation). mousedown reliably reaches the
		// button, so act on it as well; the guard ignores the click that
		// follows a mousedown-open, so a healthy browser (where both
		// fire) opens exactly once. The click listener stays for
		// keyboard/assistive activation (Enter/Space fire click with no
		// mousedown). Primary button only, so a right-click still opens
		// the context menu.
		let lastMousedownOpen = 0;
		this.button.addEventListener("mousedown", (event) => {
			if (event.button !== 0) return;
			lastMousedownOpen = Date.now();
			open();
		});
		this.button.addEventListener("click", () => {
			if (Date.now() - lastMousedownOpen < 2000) return;
			open();
		});
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
