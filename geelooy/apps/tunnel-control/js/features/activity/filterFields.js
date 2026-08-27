// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";

/**
 * @file Creates account-activity filters and routes them to safe filtering layers.
 * @description
 * The Awtsmoos renews attention and stream without making a filter into authority.
 * Awtsmoos.com sends supported identity fields to the server while conversation
 * narrowing remains local, preserving the complete authorized account subscription.
 */

const LOCAL_ONLY_FILTERS = new Set([
	"conversationId",
	"streamId"
]);

/** Creates the complete toolbar field collection. */
export function createFilterFields(runtime) {
	return [
		textFilter("Tunnel", "tunnelName", runtime),
		textFilter("Agent", "agentId", runtime),
		textFilter("Mission", "missionId", runtime),
		textFilter("Room", "roomId", runtime),
		textFilter("Conversation", "conversationId", runtime),
		severityFilter(runtime)
	];
}

function textFilter(label, key, runtime) {
	const input = h("input", {
		attrs: {
			type: "search",
			placeholder: `Any ${label.toLowerCase()}`,
			"aria-label": `${label} filter`,
			autocomplete: "off"
		}
	});
	input.addEventListener("change", () => {
		applyFilter(runtime, key, input.value.trim());
	});
	return {
		root: field(label, input),
		input
	};
}

function severityFilter(runtime) {
	const values = [
		"",
		"debug",
		"info",
		"notice",
		"warning",
		"error",
		"critical"
	];
	const select = h("select", {
		attrs: { "aria-label": "Severity filter" },
		children: values.map((value) => h("option", {
			attrs: { value },
			text: value || "Any severity"
		}))
	});
	select.addEventListener("change", () => {
		applyFilter(runtime, "severity", select.value);
	});
	return {
		root: field("Severity", select),
		input: select
	};
}

function applyFilter(runtime, key, value) {
	const filters = { ...runtime.store.filters };
	if (value) {
		filters[key] = value;
	} else {
		delete filters[key];
	}
	if (LOCAL_ONLY_FILTERS.has(key)) {
		runtime.store.setFilters(filters);
		return;
	}
	runtime.socket?.updateFilters(filters);
}

function field(label, control) {
	return h("label", {
		classes: ["awt-activity-toolbar__field"],
		children: [
			h("span", { text: label }),
			control
		]
	});
}

export { LOCAL_ONLY_FILTERS };
