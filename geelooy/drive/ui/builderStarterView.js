//B"H
//Boruch Hashem
//Blessed be He

import { websiteStarters } from "../builder/starterCatalog.js";
import { canMutateWorkspace } from "../core/accessState.js";
import { actionButton, createElement } from "./dom.js";
import { canUseBuilderStarter, loadBuilderStarterAccess } from "./builderStarterAccess.js";
import { openBuilderCommerce } from "./builderCommerceBridge.js";

/**
 * @module BuilderStarterView
 * @description Shows free source starters and entitlement-protected premium source without leaking premium files into the client bundle.
 */
export function createBuilderStarterView(actions) {
	const starters = websiteStarters();
	const cards = starters.map(starter => starterCard(starter, actions));
	const element = createElement("div", {
		className: "builder-starters",
		children: [heading(), ...cards.map(card => card.element)]
	});
	let access = { loaded: false, authenticated: false, owned: new Set() };
	let lastState = {};
	void refreshAccess();
	window.addEventListener("awtsmoos:commerce:purchase", () => void refreshAccess());
	return {
		element,
		render(state) {
			lastState = state;
			const writable = canMutateWorkspace(state) && !state.busyAction;
			for (const card of cards) card.render(writable, access);
		}
	};

	async function refreshAccess() {
		access = await loadBuilderStarterAccess();
		const writable = canMutateWorkspace(lastState) && !lastState.busyAction;
		for (const card of cards) card.render(writable, access);
	}
}

function heading() {
	return createElement("div", { className: "builder-starter-heading", children: [
		createElement("strong", { text: "Start from real source" }),
		createElement("span", { text: "Free starters stay open. Pro templates are protected digital goods; the 2,500,000 P pack unlocks all three." })
	] });
}

function starterCard(starter, actions) {
	let owned = !starter.premium;
	const badge = createElement("span", { className: "builder-starter-badge" });
	const button = actionButton("Use", () => {
		if (starter.premium && !owned) return openBuilderCommerce();
		return actions.createStarter(starter.id);
	}, { className: "button quiet" });
	const element = createElement("article", {
		className: `builder-starter-card${starter.premium ? " premium" : ""}`,
		children: [
			createElement("div", { children: [
				createElement("div", { className: "builder-starter-title", children: [createElement("strong", { text: starter.label }), badge] }),
				createElement("p", { text: starter.description })
			] }),
			button
		]
	});
	return { element, render };

	function render(writable, access) {
		owned = canUseBuilderStarter(starter, access);
		button.textContent = starter.premium && !owned ? "Unlock" : "Use";
		button.disabled = owned && !writable;
		badge.textContent = starter.premium ? (owned ? "Owned" : `${Number(starter.pricePerutahs).toLocaleString()} P`) : "Free";
		badge.dataset.tone = owned ? "owned" : starter.premium ? "premium" : "free";
		button.title = starter.premium && !owned
			? "Open the Peruta store to unlock this protected source template"
			: writable ? "Create editable HTML, CSS, and JavaScript" : "Write authority is required to create starter files";
	}
}
