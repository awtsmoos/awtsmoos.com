//B"H
// Boruch Hashem
// Blessed is He

import { websiteStarters } from "../builder/starterCatalog.js";
import { canMutateWorkspace } from "../core/accessState.js";
import { actionButton, createElement } from "./dom.js";

/** The Awtsmoos offers transparent beginnings only when the current workspace truthfully permits real file writes. */
export function createBuilderStarterView(actions) {
	const buttons = [];
	const element = createElement("div", {
		className: "builder-starters",
		children: [
			heading(),
			...websiteStarters().map(starter => starterCard(starter, actions, buttons))
		]
	});
	return {
		element,
		render(state) {
			const allowed = canMutateWorkspace(state) && !state.busyAction;
			for (const button of buttons) {
				button.disabled = !allowed;
				button.title = allowed ? "Create readable HTML, CSS, and JavaScript" : "Write authority is required to create starter files";
			}
		}
	};
}

function heading() {
	return createElement("div", { className: "builder-starter-heading", children: [
		createElement("strong", { text: "Start from real source" }),
		createElement("span", { text: "Creates index.html, styles.css, and site.js only when those names are free." })
	] });
}

function starterCard(starter, actions, buttons) {
	const button = actionButton("Use", () => actions.createStarter(starter.id), { className: "button quiet" });
	buttons.push(button);
	return createElement("article", {
		className: "builder-starter-card",
		children: [
			createElement("div", { children: [
				createElement("strong", { text: starter.label }),
				createElement("p", { text: starter.description })
			] }),
			button
		]
	});
}
