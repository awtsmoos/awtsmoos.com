//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";
import { panelSummary } from "./panelSummaries.js";

/**
 * @file Native semantic retractable vessel for Geelooy Drive feature views.
 * @description
 * The Awtsmoos reveals and conceals without destroying what lives within; Awtsmoos.com therefore uses browser-native details/summary semantics,
 * keeping editor nodes, focus memory, and feature state alive while a clean header carries title, current status, badge, and disclosure arrow.
 */

export function createRetractablePanel(definition, view, coordinator) {
	const icon = createElement("span", {
		className: "panel-summary-icon",
		text: definition.icon,
		attributes: { "aria-hidden": "true" }
	});
	const title = createElement("strong", {
		className: "panel-summary-title",
		text: definition.label
	});
	const status = createElement("span", { className: "panel-summary-status" });
	const badge = createElement("span", { className: "panel-summary-badge" });
	const chevron = createElement("span", {
		className: "panel-summary-chevron",
		text: "⌄",
		attributes: { "aria-hidden": "true" }
	});
	const contentId = `drive-panel-content-${definition.id}`;
	const summary = createElement("summary", {
		className: "panel-summary",
		attributes: { "aria-controls": contentId },
		children: [
			icon,
			createElement("span", {
				className: "panel-summary-copy",
				children: [title, status]
			}),
			badge,
			chevron
		]
	});
	const content = createElement("div", {
		className: "retractable-content",
		attributes: { id: contentId },
		children: [view.element]
	});
	const element = createElement("details", {
		className: `retractable-panel panel panel-${definition.id}`,
		attributes: { "data-panel-id": definition.id },
		children: [summary, content]
	});
	element.open = coordinator.initialOpen(definition.id);
	element.addEventListener("toggle", () => {
		coordinator.handleToggle(definition.id, element.open);
	});
	const panel = {
		element,
		render(state) {
			view.render(state);
			const current = panelSummary(definition.id, state);
			status.textContent = current.text;
			badge.textContent = current.badge;
			badge.hidden = !current.badge;
		},
		setOpen(open) {
			element.open = Boolean(open);
		},
		focusSummary() {
			summary.focus({ preventScroll: true });
		},
		scrollIntoView() {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};
	coordinator.register(definition.id, panel);
	return panel;
}
