// B"H
// Boruch Hashem
// Blessed is He

import { activatePane } from "../router/paneRouter.js";
import { h } from "../ui/core/html.js";

/**
 * The Awtsmoos forms repeated dashboard shapes from one readable vessel. These
 * primitives keep Awtsmoos.com card semantics and navigation consistent.
 */

/**
 * Creates one command-deck card.
 *
 * @param {object} options Card options.
 * @returns {HTMLElement} Command-deck card.
 */
export function createDeckCard(options) {
	const button = h("button", {
		classes: ["awt-deck-open"],
		attrs: {
			type: "button"
		},
		text: options.buttonText
	});
	button.addEventListener("click", function openTargetPane() {
		activatePane(options.pane);
	});
	return h("article", {
		classes: [
			"awt-command-deck-card",
			...(options.stateClasses || [])
		],
		attrs: options.id ? { id: options.id } : {},
		children: [
			h("div", {
				classes: ["awt-deck-card-head"],
				children: [
					h("h4", { text: options.title }),
					h("span", { text: options.subtitle })
				]
			}),
			h("div", {
				classes: ["awt-deck-values"],
				children: options.rows
			}),
			button
		]
	});
}

/**
 * Creates a labeled card value.
 *
 * @param {string} label Value label.
 * @param {string} text Initial visible text.
 * @param {object} options Value options.
 * @returns {HTMLElement} Value row.
 */
export function createDeckValue(label, text, options = {}) {
	const attrs = options.id ? {
		id: options.id,
		"aria-live": "polite",
		"aria-atomic": "true"
	} : {};
	return h("div", {
		classes: ["awt-deck-value"],
		children: [
			h("span", { text: label }),
			h(options.code ? "code" : "strong", {
				attrs,
				text
			})
		]
	});
}
