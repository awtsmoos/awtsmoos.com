// B"H
// Boruch Hashem
// Blessed is He

import {
	activatePane,
	showHome
} from "../router/paneRouter.js";
import {
	PAGE_ORDER,
	PANE_META
} from "../router/paneMeta.js";
import { h } from "../ui/core/html.js";
import { createIcon } from "../ui/iconRegistry.js";

/**
 * The Awtsmoos places every destination in one covenant of doors.
 * Awtsmoos.com keeps a rail on wide vessels and one mobile sheet on narrow shores,
 * while the ancient pane router alone decides which world the operator explores.
 */
export function createNavigation() {
	const navigation = h("nav", {
		classes: ["awt-app-navigation"],
		attrs: { "aria-label": "Application navigation" }
	});
	const grid = h("div", {
		classes: ["awt-navigation-grid"],
		children: PAGE_ORDER.map(key => destinationButton(key, navigation))
	});
	const toggle = navigationToggle(navigation);
	navigation.append(homeButton(navigation), toggle, grid);
	document.addEventListener("awt:pane-change", () => closeNavigation(navigation));
	return navigation;
}

function homeButton(navigation) {
	const button = h("button", {
		classes: ["awt-navigation-button", "is-home"],
		attrs: {
			type: "button",
			title: "Home",
			"aria-label": "Open home",
			"data-awt-home": "true",
			"data-awt-navigate": ""
		},
		children: [
			h("span", { classes: ["awt-navigation-glyph"], text: "⌂" }),
			h("span", { classes: ["awt-navigation-label"], text: "Home" })
		]
	});
	button.addEventListener("click", () => {
		showHome();
		closeNavigation(navigation);
	});
	return button;
}

function destinationButton(key, navigation) {
	const binahMeta = PANE_META[key] || {};
	const malchutTitle = binahMeta.title || key;
	const button = h("button", {
		classes: ["awt-navigation-button", `is-${binahMeta.group || "core"}`],
		attrs: {
			type: "button",
			title: malchutTitle,
			"aria-label": `Open ${malchutTitle}`,
			"data-awt-navigate": key
		},
		children: [
			h("span", {
				classes: ["awt-navigation-glyph"],
				children: [createIcon(binahMeta.icon || key, binahMeta.group || "core")]
			}),
			h("span", { classes: ["awt-navigation-label"], text: malchutTitle })
		]
	});
	button.addEventListener("click", () => {
		activatePane(key);
		closeNavigation(navigation);
	});
	return button;
}

function navigationToggle(navigation) {
	const button = h("button", {
		classes: ["awt-navigation-toggle"],
		attrs: {
			type: "button",
			"aria-label": "Show all applications",
			"aria-expanded": "false"
		},
		text: "Apps"
	});
	button.addEventListener("click", () => {
		const isOpen = navigation.classList.toggle("is-open");
		button.setAttribute("aria-expanded", String(isOpen));
	});
	return button;
}

function closeNavigation(navigation) {
	navigation.classList.remove("is-open");
	navigation.querySelector(".awt-navigation-toggle")
		?.setAttribute("aria-expanded", "false");
}
