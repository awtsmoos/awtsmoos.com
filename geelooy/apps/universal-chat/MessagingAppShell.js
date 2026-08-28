//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MessagingAppShell
 * @description
 * The Awtsmoos is one beyond rail and pane, while Awtsmoos.com lets every chamber carry a clear
 * purpose in light; first paint yields atomically to the live shell so no duplicate palace survives night.
 */

import { collectMessagingElements } from "./MessagingElementMap.js";
import {
	createMobileMoreButton,
	createRailButton,
	createRailDivider
} from "./MessagingRailFactory.js";
import {
	messagingSection,
	messagingSections
} from "./MessagingSectionCatalog.js";
import { messagingShellTemplate } from "./MessagingShellTemplate.js";

/**
 * @class MessagingAppShell
 * @description Owns the stable messaging workspace shell while section controllers own live data and actions.
 */
export class MessagingAppShell {
	/**
	 * @description Creates the live messaging shell and atomically replaces any static first-paint fallback.
	 * @param {HTMLElement} root Existing application mount whose fallback children may be replaced safely.
	 * @returns {MessagingAppShell} Ready shell with cached elements and rendered navigation rail.
	 */
	constructor(root = document.body) {
		this.root = document.createElement("main");
		this.root.className = "messaging-app";
		this.root.dataset.mobileView = "list";
		this.root.innerHTML = messagingShellTemplate();
		root.replaceChildren(this.root);
		this.elements = collectMessagingElements(this.root);
		this.renderRail();
		this.elements = collectMessagingElements(this.root);
	}

	/**
	 * @description Rebuilds desktop and mobile section doors from the shared immutable section catalog.
	 * @returns {void} Replaces only rail-button children and preserves the rest of the live shell.
	 */
	renderRail() {
		this.elements.rail.replaceChildren();
		let previousGroup = null;
		for (const section of messagingSections()) {
			if (previousGroup && previousGroup !== section.group) {
				this.elements.rail.appendChild(createRailDivider());
			}
			this.elements.rail.appendChild(createRailButton(section));
			previousGroup = section.group;
		}
		this.elements.rail.appendChild(createMobileMoreButton());
	}

	/**
	 * @description Marks a known section current and broadcasts its presentation identity without rerouting twice.
	 * @param {string} id Section identifier from the shared messaging catalog.
	 * @returns {void} Updates navigation, copy, layout state, and emits one selection event.
	 */
	selectSection(id) {
		const section = messagingSection(id);
		for (const button of this.elements.rail.querySelectorAll("[data-section]")) {
			const current = button.dataset.section === id;
			button.classList.toggle("is-active", current);
			current
				? button.setAttribute("aria-current", "page")
				: button.removeAttribute("aria-current");
		}
		const secondary = Boolean(section && !section.mobilePrimary);
		this.elements.mobileMoreButton?.classList.toggle("is-active", secondary);
		this.elements.mobileMoreButton?.setAttribute(
			"aria-label",
			secondary ? `More sections, current: ${section.label}` : "More sections"
		);
		this.root.classList.toggle(
			"is-special-section",
			section?.layout === "special"
		);
		this.root.dataset.section = section?.id || "";
		this.elements.sectionTitle.textContent = section?.label || "Messages";
		this.elements.sectionSummary.textContent = section?.description
			|| "One Awtsmoos social workspace";
		this.root.dispatchEvent(new CustomEvent("messaging-section-selected", {
			detail: { section: section?.id || "" }
		}));
	}
}
