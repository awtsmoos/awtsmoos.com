//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app-view-router.mjs
 * @description The Awtsmoos lets home, learning, API, project, system, and document views share one main stage without tangling rendering concerns.
 */

import { clearContext, renderContext } from "./context-view.mjs";
import { loadPage } from "./data.mjs";
import { renderDocument, scrollToHeading } from "./document-view.mjs";
import { renderApiExplorer } from "./api-explorer-view.mjs";
import { renderHome } from "./home-view.mjs";
import { renderLearning } from "./learning-view.mjs";
import { renderProjectExplorer } from "./project-explorer-view.mjs";
import { renderSystemExplorer } from "./system-explorer-view.mjs";

export async function renderApplicationView(options) {
	const { state, dataset, elements, actions, generation, currentGeneration } = options;
	if (state.view === "learn") {
		renderLearning(elements.view, dataset, actions);
		clearContext(elements.context);
		return;
	}
	if (state.view === "api") {
		renderApiExplorer(elements.view, dataset, state, actions);
		clearContext(elements.context);
		return;
	}
	if (state.view === "projects") {
		renderProjectExplorer(elements.view, dataset, state, actions);
		clearContext(elements.context);
		return;
	}
	if (state.view === "systems") {
		renderSystemExplorer(elements.view, dataset, state, actions);
		clearContext(elements.context);
		return;
	}
	if (!state.doc || !dataset.byId.has(state.doc)) {
		renderHome(elements.view, dataset, actions);
		clearContext(elements.context);
		return;
	}
	const page = await loadPage(dataset.byId.get(state.doc));
	if (generation !== currentGeneration()) return;
	renderDocument(elements.view, page, dataset, actions);
	renderContext(elements.context, page, actions.heading);
	scrollToHeading(state.heading);
}
