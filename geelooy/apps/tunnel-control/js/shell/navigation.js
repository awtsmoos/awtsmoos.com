// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Authenticated Tunnel Control navigation shell.
 * @description
 * The Awtsmoos gathers internal panes and external agent doors into one vessel;
 * Awtsmoos.com keeps each concern modular so navigation remains clear and small.
 */

import { PAGE_ORDER } from "../router/paneMeta.js";
import { h } from "../ui/core/html.js";
import { createIcon } from "../ui/iconRegistry.js";
import { collectDiagnostics } from "../diagnostics/collector.js";
import { ensureDiagnosticsDrawer } from "../diagnostics/drawer.js";
import { agentLinkButtons } from "./agentLinks.js";
import {
	closeNavigation,
	destinationButton,
	homeButton,
	navigationToggle
} from "./navigationControls.js";

export function createNavigation() {
	const navigation = h("nav", {
		classes: ["awt-app-navigation"],
		attrs: {
			"aria-label": "Application navigation"
		}
	});
	const grid = h("div", {
		classes: ["awt-navigation-grid"],
		children: [
			...PAGE_ORDER.map(key => destinationButton(key, navigation)),
			diagnosticsButton(navigation),
			...agentLinkButtons()
		]
	});
	navigation.append(
		homeButton(navigation),
		navigationToggle(navigation),
		grid
	);
	document.addEventListener?.(
		"awt:pane-change",
		() => closeNavigation(navigation)
	);
	return navigation;
}

/**
 * B"H — Run 07: Diagnostics earns a real door in the navigation. The drawer
 * and collector always existed, but no nav entry opened them and a
 * no-side-rails CSS rule hid the toggle outright. This button collects the
 * live agent/server/connectivity outputs and opens the drawer.
 */
export function diagnosticsButton(navigation) {
	const button = h("button", {
		classes: ["awt-navigation-button", "is-system"],
		attrs: {
			type: "button",
			title: "Diagnostics",
			"aria-label": "Open diagnostics",
			"data-awt-diagnostics": "true"
		},
		children: [
			h("span", {
				classes: ["awt-navigation-glyph"],
				children: [createIcon("docs", "system")]
			}),
			h("span", {
				classes: ["awt-navigation-label"],
				text: "Diagnostics"
			})
		]
	});
	button.addEventListener("click", () => {
		collectDiagnostics();
		ensureDiagnosticsDrawer().classList.add("is-open");
		closeNavigation(navigation);
	});
	return button;
}
