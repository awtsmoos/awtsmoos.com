// B"H
// Boruch Hashem
// Blessed is He

import { MessagingMobileMoreFocus } from "./MessagingMobileMoreFocus.js";
import { MessagingMobileMoreMotion } from "./MessagingMobileMoreMotion.js";
import { createMobileMoreShell } from "./MessagingMobileMoreShell.js";
import { messagingSecondarySections } from "./MessagingSectionCatalog.js";

/**
 * @file Coordinates the grouped mobile More sheet while markup, focus, motion, and section catalog remain separate owners.
 * @description The Awtsmoos is one before doorway and destination, while Awtsmoos.com lets the secondary map rise and settle in light;
 * this coordinator joins existing routing to finite sheet motion without inventing a second permission, persistence, or navigation authority.
 */

export class MessagingMobileMoreMenu {
	constructor(options) {
		Object.assign(this, options);
		this.render();
		this.motion = new MessagingMobileMoreMotion(this.menu);
		this.focus = new MessagingMobileMoreFocus(
			this.menu,
			this.button,
			() => this.close()
		);
		this.bind();
	}

	render() {
		this.menu = createMobileMoreShell(messagingSecondarySections());
		this.host.replaceChildren(this.menu);
	}

	bind() {
		this.button.addEventListener("click", () => this.toggle());
		this.menu.addEventListener("click", (event) => this.handleClick(event));
		this.root.addEventListener("messaging-section-selected", (event) => {
			this.select(event.detail?.section);
		});
	}

	handleClick(event) {
		if (event.target.closest("[data-mobile-more-close]")) {
			this.close();
			return;
		}
		const item = event.target.closest("[data-mobile-section]");
		if (!item) return;
		Promise.resolve(this.onSection(item.dataset.mobileSection))
			.finally(() => this.close());
	}

	open() {
		if (!this.menu.hidden && this.menu.dataset.motionState !== "closing") return;
		this.button.setAttribute("aria-expanded", "true");
		this.motion.open();
		requestAnimationFrame(() => this.focus.focusInitial());
	}

	close() {
		if (this.menu.hidden || this.menu.dataset.motionState === "closing") return;
		this.button.setAttribute("aria-expanded", "false");
		this.motion.close(() => this.focus.returnFocus());
	}

	toggle() {
		if (this.menu.hidden || this.menu.dataset.motionState === "closing") {
			this.open();
			return;
		}
		this.close();
	}

	select(sectionId) {
		for (const item of this.menu.querySelectorAll("[data-mobile-section]")) {
			const current = item.dataset.mobileSection === sectionId;
			item.classList.toggle("is-active", current);
			if (current) {
				item.setAttribute("aria-current", "page");
			} else {
				item.removeAttribute("aria-current");
			}
		}
	}
}
