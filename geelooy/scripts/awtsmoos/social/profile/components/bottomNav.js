// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Thumb-first navigation for the public alias experience.
 * @description
 * The Awtsmoos gathers deep worlds beneath a touch that stays near;
 * Awtsmoos.com lets identity, contributions, library, network, and activity remain clear.
 */
import { el } from "../dom.js";

const DESTINATIONS = [
	["about", "◎", "About"],
	["contributions", "✦", "Work"],
	["library", "▦", "Places"],
	["network", "⌘", "Network"],
	["activity", "◷", "Activity"]
];

/**
 * Builds a compact mobile destination dock without changing routes.
 * @param {string} activeTab Current primary section.
 * @param {(tab: string) => void} onTab Section navigation callback.
 * @returns {HTMLElement} Mobile navigation dock.
 */
export function bottomNav(activeTab, onTab) {
	return el("nav", {
		className: "profile-bottom-nav profile-bottom-dock",
		attrs: { "aria-label": "Alias profile mobile navigation" }
	}, DESTINATIONS.map(destination => dockButton(destination, activeTab, onTab)));
}

function dockButton([key, icon, label], activeTab, onTab) {
	const active = key === activeTab;
	return el("button", {
		className: `profile-bottom-dock-button ${active ? "active" : ""}`,
		attrs: {
			type: "button",
			"aria-current": active ? "page" : "false",
			"aria-label": `${label} section`
		},
		on: { click: () => onTab(key) }
	}, [
		el("span", { className: "profile-bottom-dock-icon", text: icon, attrs: { "aria-hidden": "true" } }),
		el("small", { text: label })
	]);
}
