//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-explorer-view.mjs
 * @description The Awtsmoos lets every discovered project boundary become an explorable source-backed system map instead of a static atlas row.
 */

import { append, clear, element } from "./dom.mjs";
import { renderProjectDetail } from "./project-detail.mjs";
import { renderProjectList } from "./project-list.mjs";

export function renderProjectExplorer(root, dataset, state, actions) {
	clear(root);
	const hero = element("section", { className: "project-explorer-hero" });
	append(hero,
		element("p", { className: "eyebrow", text: "Project Explorer · boundaries + dependencies + entries" }),
		element("h1", { text: "Explore Awtsmoos.com project by project." }),
		element("p", { text: `${dataset.projects.length} current boundaries. File shape, imports, public entries, symbols, tests, and docs remain qualified evidence rather than runtime guarantees.` })
	);
	const shell = element("div", { className: "project-explorer-shell" });
	const list = element("aside", { className: "project-explorer-list" });
	const detail = element("article", { className: "project-explorer-detail" });
	renderProjectList(list, dataset, state, {
		select: actions.selectProject,
		update: actions.updateProjectFilters
	});
	renderProjectDetail(detail, dataset.projectById.get(state.project) || null, dataset, actions);
	append(shell, list, detail);
	append(root, hero, shell);
}
