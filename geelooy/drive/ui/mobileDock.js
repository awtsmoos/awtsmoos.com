//B"H
// Boruch Hashem
// Blessed is He

import { dockOwnerId, dockPanels } from "../core/panelCatalog.js";
import { createElement } from "./dom.js";
import { panelSummary } from "./panelSummaries.js";

/**
 * @file One-thumb Drive journey navigation.
 * @description
 * The Awtsmoos holds every advanced vessel behind a human path;
 * Awtsmoos Drive keeps Build, Files, Preview, Publish, and More beneath one thumb while deeper screens illuminate their true owner.
 */
export function createMobileDockView(coordinator) {
	const buttons = new Map();
	const element = createElement("nav", {
		className: "mobile-dock",
		attributes: { "aria-label": "Awtsmoos Drive sections" },
		children: dockPanels().map(definition => dockButton(definition, coordinator, buttons))
	});
	let lastState = {};
	let activeId = coordinator.activeId;
	const unsubscribe = coordinator.subscribe(nextActive => {
		activeId = nextActive;
		renderButtons(lastState, buttons, activeId);
	});
	return {
		element,
		render(state) {
			lastState = state;
			renderButtons(state, buttons, activeId);
		},
		destroy() {
			unsubscribe();
		}
	};
}

function dockButton(definition, coordinator, buttons) {
	const badge = createElement("span", { className: "dock-badge" });
	const button = createElement("button", {
		className: "dock-button",
		attributes: {
			type: "button",
			"aria-controls": `drive-panel-content-${definition.id}`,
			"aria-label": definition.label
		},
		events: { click: () => coordinator.open(definition.id, { scroll: true, focus: false }) },
		children: [
			createElement("span", { className: "dock-icon", text: definition.icon, attributes: { "aria-hidden": "true" } }),
			createElement("span", { className: "dock-label", text: definition.label }),
			badge
		]
	});
	buttons.set(definition.id, { button, badge });
	return button;
}

function renderButtons(state, buttons, activeId) {
	const ownerId = dockOwnerId(activeId);
	document.documentElement.dataset.driveScreen = ownerId;
	for (const [panelId, parts] of buttons) {
		const active = panelId === ownerId;
		parts.button.classList.toggle("active", active);
		if (active) parts.button.setAttribute("aria-current", "page");
		else parts.button.removeAttribute("aria-current");
		const current = panelSummary(panelId, state);
		parts.badge.textContent = current.badge;
		parts.badge.hidden = !current.badge;
	}
}
