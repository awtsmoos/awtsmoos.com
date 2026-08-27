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
