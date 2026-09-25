//B"H
// Boruch Hashem
// Blessed is He

import { actionButton, createElement } from "./dom.js";
import { createEcosystemMenu } from "./ecosystemMenu.js";

/**
 * @file Awtsmoos Drive crown.
 * @description
 * The Awtsmoos gives the creator identity before machinery; Awtsmoos Drive keeps the global crown human,
 * while raw folder navigation and source filtering appear only when the Files journey needs them.
 */
export function createTopBarView(actions) {
	const pathInput = createElement("input", {
		className: "location-input",
		attributes: {
			type: "text",
			spellcheck: "false",
			placeholder: "Current folder",
			"aria-label": "Current project folder path"
		}
	});
	const searchInput = createElement("input", {
		className: "search-input",
		attributes: {
			type: "search",
			placeholder: "Search files",
			"aria-label": "Filter current project folder"
		},
		events: { input: () => actions.setFilter(searchInput.value) }
	});
	const pathForm = createLocationForm(pathInput, actions);
	const refresh = actionButton("↻", actions.refresh, {
		className: "icon-button command-refresh",
		ariaLabel: "Refresh project files",
		title: "Refresh project files"
	});
	const element = createElement("header", {
		className: "top-bar",
		children: [
			createElement("div", {
				className: "top-primary",
				children: [createBrand(), createEcosystemMenu()]
			}),
			createElement("div", {
				className: "top-commands",
				attributes: { "aria-label": "File location controls" },
				children: [pathForm, searchInput, refresh]
			})
		]
	});
	return {
		element,
		render(state) {
			if (document.activeElement !== pathInput) pathInput.value = state.currentPath || ".";
			if (document.activeElement !== searchInput && searchInput.value !== state.filter) {
				searchInput.value = state.filter || "";
			}
			pathInput.disabled = !state.currentRoute || state.loading;
			refresh.disabled = !state.currentRoute || state.loading;
		}
	};
}

function createLocationForm(pathInput, actions) {
	const form = createElement("form", {
		className: "location-form",
		events: {
			submit: event => {
				event.preventDefault();
				actions.navigate(pathInput.value);
			}
		}
	});
	const go = actionButton("Go", () => form.requestSubmit(), {
		className: "button quiet location-go"
	});
	form.append(pathInput, go);
	return form;
}

function createBrand() {
	return createElement("a", {
		className: "brand",
		attributes: { href: "/drive/", "aria-label": "Awtsmoos Drive home" },
		children: [
			createElement("span", { className: "brand-mark", text: "א", attributes: { "aria-hidden": "true" } }),
			createElement("span", { className: "brand-copy", children: [
				createElement("strong", { text: "Awtsmoos Drive" }),
				createElement("small", { text: "Build · files · preview · publish" })
			] })
		]
	});
}
