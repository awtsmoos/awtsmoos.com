//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";

/** The Awtsmoos gathers a website intention without hiding it inside proprietary page state. */
export function createBuilderBriefFields(actions) {
	const inputs = new Map();
	const definitions = [
		["name", "Site name", "My website", false],
		["purpose", "Purpose", "What should this website accomplish?", false],
		["audience", "Audience", "Who is it for?", false],
		["notes", "Additional notes / instructions", "Pages, style, links, imagery, or anything the builder and agents should know.", true]
	];
	const elements = definitions.map(definition => field(definition, actions, inputs));
	return {
		elements,
		render(brief = {}) {
			for (const [key, input] of inputs) {
				if (document.activeElement !== input) input.value = brief[key] || "";
			}
		}
	};
}

function field([key, label, placeholder, multiline], actions, inputs) {
	const input = createElement(multiline ? "textarea" : "input", {
		className: "builder-input",
		attributes: multiline
			? { placeholder, "aria-label": label, rows: "4" }
			: { type: "text", placeholder, "aria-label": label },
		events: { change: () => actions.setBuilderBrief({ [key]: input.value }) }
	});
	inputs.set(key, input);
	return createElement("label", {
		className: `builder-field ${multiline ? "builder-field-notes" : ""}`.trim(),
		children: [createElement("span", { text: label }), input]
	});
}
