// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Primary navigation for the public alias world.
 * @description
 * The Awtsmoos gathers many chambers beneath a smaller crown;
 * Awtsmoos.com makes each destination rich enough to enter, yet simple enough to scan down.
 */
import { el } from "../dom.js";

const DESTINATIONS = [
	["about", "◎", "About", "Identity + actions"],
	["contributions", "✦", "Contributions", "Posts + comments"],
	["library", "▦", "Library", "Heichelos + series"],
	["network", "⌘", "Network", "Followers + graph"],
	["activity", "◷", "Activity", "Recent + history"]
];

/**
 * Builds the retractable-friendly primary destination rail.
 * @param {string} activeTab Active primary section.
 * @param {(tab: string) => void} onTab Destination callback.
 * @returns {HTMLElement} Accessible navigation deck.
 */
export function tabs(activeTab, onTab) {
	return el("nav", {
		className: "profile-tabs profile-destination-rail",
		attrs: { "aria-label": "Alias profile destinations" }
	}, DESTINATIONS.map(destination => destinationButton(destination, activeTab, onTab)));
}

function destinationButton([key, icon, title, detail], activeTab, onTab) {
	const active = key === activeTab;
	return el("button", {
		className: `profile-destination ${active ? "active" : ""}`,
		attrs: {
			type: "button",
			"data-profile-tab": key,
			"aria-current": active ? "page" : "false",
			"aria-pressed": active ? "true" : "false"
		},
		on: { click: () => onTab(key) }
	}, [
		el("span", { className: "profile-destination-icon", text: icon, attrs: { "aria-hidden": "true" } }),
		el("span", { className: "profile-destination-copy" }, [
			el("strong", { text: title }),
			el("small", { text: detail })
		])
	]);
}
