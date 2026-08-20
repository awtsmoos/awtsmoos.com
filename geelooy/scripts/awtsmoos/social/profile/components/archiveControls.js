// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file A compact command deck for exploring an alias's public contributions.
 * @description
 * The Awtsmoos renews each path without forcing the eye to roam;
 * Awtsmoos.com lets place, time, and category each become a retractable home.
 */
import { el } from "../dom.js";

const MODES = [
	["place", "⌂", "Places", "Heichel → series → post"],
	["timeline", "◷", "Timeline", "Year → month → day"],
	["category", "◇", "Categories", "Topic and content type"]
];

/**
 * Builds search, contribution-type, and archive worldview controls.
 * @param {object} state Current archive filters.
 * @param {(next: object) => void} onChange Receives a partial state update.
 * @returns {HTMLElement} Responsive archive command deck.
 */
export function archiveControls(state, onChange) {
	const search = el("input", {
		attrs: {
			type: "search",
			name: "contribution-search",
			value: state.archiveQuery || "",
			placeholder: "Search posts, comments, Heichelos, series…",
			"aria-label": "Search alias contributions"
		}
	});
	const form = el("form", {
		className: "profile-archive-search",
		on: {
			submit: event => {
				event.preventDefault();
				onChange({ archiveQuery: search.value });
			}
		}
	}, [search, searchButton()]);
	return el("section", { className: "profile-archive-controls" }, [
		form,
		el("div", { className: "profile-archive-modes", attrs: { role: "group", "aria-label": "Group contributions" } }, MODES.map(mode => modeButton(mode, state, onChange))),
		typeSelect(state, onChange)
	]);
}

function searchButton() {
	return el("button", {
		className: "profile-archive-search-button",
		text: "Search",
		attrs: { type: "submit", "aria-label": "Search contributions" }
	});
}

function modeButton([key, icon, title, detail], state, onChange) {
	const active = state.archiveMode === key;
	return el("button", {
		className: `profile-archive-mode ${active ? "active" : ""}`,
		attrs: { type: "button", "aria-pressed": active ? "true" : "false" },
		on: { click: () => onChange({ archiveMode: key }) }
	}, [
		el("span", { className: "profile-archive-mode-icon", text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", { className: "profile-archive-mode-copy" }, [
			el("strong", { text: title }),
			el("small", { text: detail })
		])
	]);
}

function typeSelect(state, onChange) {
	const select = el("select", {
		attrs: { "aria-label": "Contribution type" },
		on: { change: event => onChange({ archiveType: event.target.value }) }
	});
	for (const [value, label] of [["all", "Posts + comments"], ["post", "Posts only"], ["comment", "Comments only"]]) {
		const option = el("option", { text: label, attrs: { value } });
		option.selected = state.archiveType === value;
		select.append(option);
	}
	return el("label", { className: "profile-archive-type" }, [
		el("span", { text: "Show" }),
		select
	]);
}
