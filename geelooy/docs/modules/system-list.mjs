//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-list.mjs
 * @description The Awtsmoos lets eighteen curated system concepts stay scannable through shareable district, evidence, and text filters.
 */

import { append, badge, clear, element } from "./dom.mjs";
import { filterSystems } from "./system-filter.mjs";

function option(value, label, selected) {
	const node = element("option", { text: label });
	node.value = value;
	node.selected = value === selected;
	return node;
}

function selectControl(label, values, selected, onChange) {
	const wrap = element("label", { className: "system-filter-control" });
	append(wrap, element("span", { text: label }));
	const select = element("select");
	for (const [value, title] of values) select.append(option(value, title, selected));
	select.addEventListener("change", () => onChange(select.value));
	wrap.append(select);
	return wrap;
}

function textSearch(state, actions) {
	const input = element("input");
	input.type = "search";
	input.placeholder = "Filter title, tag, source, project…";
	input.value = state.systemq || "";
	const commit = () => {
		if (input.value !== (state.systemq || "")) actions.update({ systemq: input.value });
	};
	input.addEventListener("change", commit);
	input.addEventListener("keydown", event => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		commit();
	});
	return input;
}

function filterBar(state, actions) {
	const bar = element("div", { className: "system-filter-bar" });
	append(bar,
		textSearch(state, actions),
		selectControl("District", [["", "All districts"], ["data", "Data"], ["security", "Security"], ["realtime", "Realtime"]], state.systemDistrict, value => actions.update({ systemDistrict: value })),
		selectControl("Evidence", [["", "Any evidence"], ["environment", "Environment names"], ["application", "Realtime apps"], ["event", "Events/messages"], ["project", "Projects"]], state.systemEvidence, value => actions.update({ systemEvidence: value }))
	);
	return bar;
}

function systemRow(system, selected, actions) {
	const button = element("button", { className: "system-row", type: "button" });
	button.dataset.selected = selected ? "true" : "false";
	button.addEventListener("click", () => actions.select(system.systemId));
	const meta = element("span", { className: "system-row-meta" });
	append(meta,
		badge(system.district),
		system.environmentEvidence?.length ? badge(`${system.environmentEvidence.length} env`) : null,
		system.realtimeApplications?.length ? badge(`${system.realtimeApplications.length} apps`) : null,
		system.eventEvidence?.length ? badge(`${system.eventEvidence.length} events`) : null
	);
	append(button,
		element("strong", { text: system.title }),
		element("code", { text: system.systemId }),
		meta
	);
	return button;
}

export function renderSystemList(root, dataset, state, actions) {
	clear(root);
	const filtered = filterSystems(dataset.systems, state);
	append(root,
		filterBar(state, actions),
		element("p", { className: "system-result-count", text: `${filtered.length} of ${dataset.systems.length} systems` })
	);
	const list = element("div", { className: "system-list" });
	for (const system of filtered) list.append(systemRow(system, state.system === system.systemId, actions));
	if (!filtered.length) list.append(element("p", { className: "system-empty", text: "No systems match these filters." }));
	root.append(list);
	return filtered;
}
