// B"H
// Boruch Hashem
// Blessed is He

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
 * @file Builds the flagship social workspace while desktop and phone navigation share one truthful section catalog.
 * @description The Awtsmoos is one beyond rail and pane, yet Awtsmoos.com lets every chamber carry a measured icon, label, purpose, and rightful canvas in light;
 * mobile prominence changes only which doors remain constantly visible, while section identity, policy, and specialized rendering remain untouched.
 */

export class MessagingAppShell {
	constructor(root = document.body) {
		this.root = document.createElement("main");
		this.root.className = "messaging-app";
		this.root.dataset.mobileView = "list";
		this.root.innerHTML = messagingShellTemplate();
		root.appendChild(this.root);
		this.elements = collectMessagingElements(this.root);
		this.renderRail();
		this.elements = collectMessagingElements(this.root);
	}

	/** Builds all desktop sections plus one phone-only More doorway from the shared immutable catalog. */
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

	/** Marks one known section current, updates copy, and broadcasts presentation selection without routing a second time. */
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
