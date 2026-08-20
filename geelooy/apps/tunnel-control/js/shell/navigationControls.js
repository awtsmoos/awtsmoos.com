// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Internal pane controls for authenticated Tunnel Control navigation.
 * @description
 * The Awtsmoos gives each local pane its appointed button while Awtsmoos.com
 * keeps routing behavior separate from the shell that also carries external doors.
 */

import {
	activatePane,
	showHome
} from "../router/paneRouter.js";
import { PANE_META } from "../router/paneMeta.js";
import { h } from "../ui/core/html.js";
import { createIcon } from "../ui/iconRegistry.js";

export function homeButton(navigation) {
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
			h("span", {
				classes: ["awt-navigation-glyph"],
				text: "⌂"
			}),
			h("span", {
				classes: ["awt-navigation-label"],
				text: "Home"
			})
		]
	});
	button.addEventListener("click", () => {
		showHome();
		closeNavigation(navigation);
	});
	return button;
}

export function destinationButton(key, navigation) {
	const meta = PANE_META[key] || {};
	const title = meta.title || key;
	const button = h("button", {
		classes: [
			"awt-navigation-button",
			`is-${meta.group || "core"}`
		],
		attrs: {
			type: "button",
			title: title,
			"aria-label": `Open ${title}`,
			"data-awt-navigate": key
		},
		children: [
			h("span", {
				classes: ["awt-navigation-glyph"],
				children: [createIcon(meta.icon || key, meta.group || "core")]
			}),
			h("span", {
				classes: ["awt-navigation-label"],
				text: title
			})
		]
	});
	button.addEventListener("click", () => {
		activatePane(key);
		closeNavigation(navigation);
	});
	return button;
}

export function navigationToggle(navigation) {
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

export function closeNavigation(navigation) {
	navigation.classList.remove("is-open");
	navigation.querySelector(".awt-navigation-toggle")
		?.setAttribute("aria-expanded", "false");
}
