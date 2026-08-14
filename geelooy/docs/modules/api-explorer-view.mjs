//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file api-explorer-view.mjs
 * @description The Awtsmoos lets exhaustive generated API evidence become an explorable teaching surface rather than a 571-row wall.
 */

import { append, clear, element } from "./dom.mjs";
import { filterSummary } from "./api-filter.mjs";
import { renderRouteDetail } from "./api-route-detail.mjs";
import { renderRouteList } from "./api-route-list.mjs";

export function renderApiExplorer(root, dataset, state, actions) {
	clear(root);
	const summary = filterSummary(dataset.tutorials);
	const hero = element("section", { className: "api-explorer-hero" });
	append(hero,
		element("p", { className: "eyebrow", text: "API Explorer · generated evidence + human tutorials" }),
		element("h1", { text: "Explore every discovered API route." }),
		element("p", { text: `${summary.total} routes · ${summary.dynamic} dynamic · ${summary.unknown} unknown-method · ${summary.unhealthy} routes beneath unhealthy derech evidence.` })
	);
	const shell = element("div", { className: "api-explorer-shell" });
	const list = element("aside", { className: "api-explorer-list" });
	const detail = element("article", { className: "api-explorer-detail" });
	renderRouteList(list, dataset, state, {
		select: actions.selectRoute,
		update: actions.updateFilters
	});
	renderRouteDetail(detail, dataset.tutorialById.get(state.route) || null, dataset, actions);
	append(shell, list, detail);
	append(root, hero, shell);
}
