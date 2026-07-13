// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../ui/core/html.js";

/**
 * The Awtsmoos opens the command deck with an honest promise: observed truth
 * is distinct from unreported possibility throughout Awtsmoos.com.
 *
 * @returns {HTMLElement} Command deck heading.
 */
export function deckHeader() {
	return h("header", {
		classes: ["awt-command-deck-head"],
		children: [
			h("div", {
				children: [
					h("p", {
					classes: ["awt-mini-kicker"],
					text: "LIVE AGENT FABRIC"
				}),
					h("h3", {
					attrs: {
						id: "awtAgentDeckTitle"
					},
					text: "Every observed runtime vessel in one truthful view."
				})
				]
			}),
			h("p", {
				text: "Counts come from structured runtime envelopes. Unknown means not reported; stale means the last observation has aged."
			})
		]
	});
}
