//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-list.mjs
 * @description The Awtsmoos lets every current project boundary stay scannable through shareable type, documentation, public-entry, test, and text filters.
 */

import { append, badge, clear, element } from "./dom.mjs";
import { filterProjects, projectTypes } from "./project-filter.mjs";

function option(value, label, selected) {
	const node = element("option", { text: label });
	node.value = value;
	node.selected = value === selected;
	return node;
}

function selectControl(label, values, selected, onChange) {
	const wrap = element("label", { className: "project-filter-control" });
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
	input.placeholder = "Filter path, dependency, entry…";
	input.value = state.projectq || "";
	const commit = () => {
		if (input.value !== (state.projectq || "")) actions.update({ projectq: input.value });
	};
	input.addEventListener("change", commit);
	input.addEventListener("keydown", event => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		commit();
	});
	return input;
}

function filterBar(dataset, state, actions) {
	const bool = [["", "Any"], ["yes", "Yes"], ["no", "No"]];
	const types = [["", "All types"], ...projectTypes(dataset.projects).map(type => [type, type])];
	const bar = element("div", { className: "project-filter-bar" });
	append(bar,
		textSearch(state, actions),
		selectControl("Type", types, state.projectType, value => actions.update({ projectType: value })),
		selectControl("Public entry", bool, state.projectPublic, value => actions.update({ projectPublic: value })),
		selectControl("Tests", bool, state.projectTests, value => actions.update({ projectTests: value })),
		selectControl("Docs", bool, state.projectDocs, value => actions.update({ projectDocs: value }))
	);
	return bar;
}

function projectRow(project, selected, actions) {
	const button = element("button", { className: "project-row", type: "button" });
	button.dataset.selected = selected ? "true" : "false";
	button.addEventListener("click", () => actions.select(project.projectId));
	const meta = element("span", { className: "project-row-meta" });
	append(meta,
		badge(project.type),
		project.publicEntries?.length ? badge(`${project.publicEntries.length} public`) : null,
		project.counts?.tests ? badge(`${project.counts.tests} tests`) : null
	);
	append(button,
		element("strong", { text: project.title || project.path }),
		element("code", { text: project.path }),
		meta
	);
	return button;
}

export function renderProjectList(root, dataset, state, actions) {
	clear(root);
	const filtered = filterProjects(dataset.projects, state);
	append(root,
		filterBar(dataset, state, actions),
		element("p", { className: "project-result-count", text: `${filtered.length} of ${dataset.projects.length} projects` })
	);
	const list = element("div", { className: "project-list" });
	for (const project of filtered) list.append(projectRow(project, state.project === project.projectId, actions));
	if (!filtered.length) list.append(element("p", { className: "project-empty", text: "No project boundaries match these filters." }));
	root.append(list);
	return filtered;
}
