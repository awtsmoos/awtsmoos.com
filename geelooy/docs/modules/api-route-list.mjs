//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file api-route-list.mjs
 * @description The Awtsmoos lets hundreds of routes remain scannable while shareable filters commit without tearing focus from the learner.
 */

import { append, badge, clear, element } from "./dom.mjs";
import { filterTutorials } from "./api-filter.mjs";

function option(value, label, selected) {
	const item = element("option", { text: label });
	item.value = value;
	item.selected = value === selected;
	return item;
}

function selectControl(label, values, selected, onChange) {
	const wrap = element("label", { className: "api-filter-control" });
	append(wrap, element("span", { text: label }));
	const select = element("select");
	for (const [value, text] of values) select.append(option(value, text, selected));
	select.addEventListener("change", () => onChange(select.value));
	wrap.append(select);
	return wrap;
}

function textSearch(state, actions) {
	const input = element("input");
	input.type = "search";
	input.placeholder = "Filter route, source, vessel…";
	input.value = state.apiq || "";
	const commit = () => {
		if (input.value !== (state.apiq || "")) actions.update({ apiq: input.value });
	};
	input.addEventListener("change", commit);
	input.addEventListener("keydown", event => {
		if (event.key === "Enter") {
			event.preventDefault();
			commit();
		}
	});
	return input;
}

function filterBar(dataset, state, actions) {
	const bar = element("div", { className: "api-filter-bar" });
	append(bar,
		textSearch(state, actions),
		selectControl("Family", [["", "All families"], ...dataset.tutorialFamilies.map(item => [item.mount, item.title])], state.family, value => actions.update({ family: value })),
		selectControl("Health", [["", "Any health"], ["OK", "Syntax OK"], ["FAIL", "Syntax fail"]], state.health, value => actions.update({ health: value })),
		selectControl("Shape", [["", "Any shape"], ["static", "Static"], ["dynamic", "Dynamic"]], state.shape, value => actions.update({ shape: value })),
		selectControl("Evidence", [["", "Any evidence"], ["source-lexical", "Method observed"], ["unknown-method", "Method unknown"]], state.confidence, value => actions.update({ confidence: value }))
	);
	return bar;
}

function routeButton(record, selected, actions) {
	const button = element("button", { className: "api-route-row", type: "button" });
	button.dataset.selected = selected ? "true" : "false";
	button.addEventListener("click", () => actions.select(record.id));
	const meta = element("span", { className: "api-route-meta" });
	append(meta,
		badge(record.methodEvidence === "unknown" ? "method ?" : record.methodEvidence),
		badge(record.derech?.status || "unknown"),
		record.dynamic ? badge("dynamic") : null
	);
	append(button,
		element("strong", { text: record.route }),
		meta,
		element("small", { text: record.source })
	);
	return button;
}

export function renderRouteList(root, dataset, state, actions) {
	clear(root);
	const filtered = filterTutorials(dataset.tutorials, state);
	append(root,
		filterBar(dataset, state, actions),
		element("p", { className: "api-result-count", text: `${filtered.length} of ${dataset.tutorials.length} routes` })
	);
	const list = element("div", { className: "api-route-list" });
	for (const record of filtered) list.append(routeButton(record, state.route === record.id, actions));
	if (!filtered.length) list.append(element("p", { className: "api-empty", text: "No routes match these filters." }));
	root.append(list);
	return filtered;
}
