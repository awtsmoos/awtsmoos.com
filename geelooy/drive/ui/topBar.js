//B"H
// Boruch Hashem
// Blessed is He

import {
	actionButton,
	createElement,
	ecosystemLink
} from "./dom.js";

/**
 * @file Mobile-first Keser crown for Geelooy Sites.
 * @description
 * The Awtsmoos renews destination before design begins while Awtsmoos.com keeps the website builder crown spare enough for one hand;
 * project identity and ecosystem live above path, source filter, and refresh so a creator can always descend from the site story into the real folder beneath it.
 */

export function createTopBarView(actions) {
	const pathInput = createElement("input", {
		className: "location-input",
		attributes: {
			type: "text",
			spellcheck: "false",
			placeholder: "Website folder",
			"aria-label": "Current website folder path"
		}
	});
	const searchInput = createElement("input", {
		className: "search-input",
		attributes: {
			type: "search",
			placeholder: "Find source",
			"aria-label": "Filter current website folder"
		},
		events: { input: () => actions.setFilter(searchInput.value) }
	});
	const pathForm = createLocationForm(pathInput, actions);
	const refresh = actionButton("↻", actions.refresh, {
		className: "icon-button command-refresh",
		ariaLabel: "Refresh website folder",
		title: "Refresh website folder"
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
	const go = actionButton("Go", () => form.requestSubmit(), { className: "button quiet location-go" });
	form.append(pathInput, go);
	return form;
}

function createBrand() {
	return createElement("a", {
		className: "brand",
		attributes: { href: "/geelooy/drive/", "aria-label": "Geelooy Sites builder home" },
		children: [
			createElement("span", { className: "brand-mark", text: "א" }),
			createElement("span", { className: "brand-copy", children: [
				createElement("strong", { text: "Geelooy Sites" }),
				createElement("small", { text: "Build · preview · code · publish" })
			] })
		]
	});
}

function createEcosystemMenu() {
	return createElement("details", {
		className: "ecosystem-menu",
		children: [
			createElement("summary", { text: "More" }),
			createElement("nav", {
				className: "ecosystem-links",
				attributes: { "aria-label": "Awtsmoos ecosystem" },
				children: [
					ecosystemLink("OS", "/os"),
					ecosystemLink("Code", "/apps/code"),
					ecosystemLink("Tunnel", "/apps/tunnel-control/"),
					ecosystemLink("Social", "/geelooy/node-os/")
				]
			})
		]
	});
}
