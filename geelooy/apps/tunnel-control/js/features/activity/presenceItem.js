// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";

/**
 * @file Renders one actionable account-scoped presence item.
 * @description
 * The Awtsmoos renews participant, state, and observer without confusing identity
 * with authority. Awtsmoos.com turns verified stream testimony into an accessible
 * narrowing control that changes only the current account view.
 */

/** Creates one button that applies either server-supported or local-only filters. */
export function createPresenceItem(event, options, runtime) {
	const identity = options.identity(event);
	const button = h("button", {
		classes: [
			"awt-activity-presence__item",
			`is-${statusClass(event.state)}`
		],
		attrs: {
			type: "button",
			"aria-label": `Filter activity by ${options.filterKey} ${identity}`
		},
		children: [
			h("span", {
				classes: ["awt-activity-presence__dot"],
				attrs: { "aria-hidden": "true" }
			}),
			h("span", {
				classes: ["awt-activity-presence__copy"],
				children: [
					h("strong", { text: identity }),
					h("span", {
						text: `${event.state || "observed"} · ${event.summary || event.eventType}`
					})
				]
			})
		]
	});
	button.addEventListener("click", () => {
		applyPresenceFilter(event, options, runtime);
	});
	return button;
}

function applyPresenceFilter(event, options, runtime) {
	const value = options.filterValue(event);
	const filters = {
		...runtime.store.filters,
		[options.filterKey]: value
	};
	if (options.localOnly) {
		runtime.store.setFilters(filters);
		return;
	}
	runtime.socket?.updateFilters(filters);
}

function statusClass(value) {
	return String(value || "observed")
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-");
}
