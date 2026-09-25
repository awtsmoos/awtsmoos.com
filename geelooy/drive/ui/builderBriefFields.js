//B"H
// Boruch Hashem
// Blessed is He

import { createElement } from "./dom.js";

/**
 * @file Progressive website brief fields.
 * @description The Awtsmoos lets the creator begin with one clear intention while deeper project context remains available without blocking creation.
 */
export function createBuilderBriefFields(actions) {
	const inputs = new Map();
	const purpose = field(["purpose", "What do you want to make?", "A Torah learning app, restaurant site, portfolio, store, dashboard…", true], actions, inputs);
	const details = createElement("details", {
		className: "builder-details",
		children: [
			createElement("summary", { text: "Project details" }),
			createElement("div", {
				className: "builder-detail-grid",
				children: [
					field(["name", "Site name", "My website", false], actions, inputs),
					field(["audience", "Audience", "Who is it for?", false], actions, inputs),
					field(["notes", "Notes / instructions", "Pages, style, links, imagery, or anything the builder should know.", true], actions, inputs)
				]
			})
		]
	});
	return {
		purpose,
		details,
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
			? { placeholder, "aria-label": label, rows: key === "purpose" ? "3" : "4", maxlength: key === "purpose" ? "300" : "1200" }
			: { type: "text", placeholder, "aria-label": label, maxlength: "160" },
		events: { change: () => actions.setBuilderBrief({ [key]: input.value }) }
	});
	inputs.set(key, input);
	return createElement("label", {
		className: `builder-field builder-field-${key}`,
		children: [createElement("span", { text: label }), input]
	});
}
