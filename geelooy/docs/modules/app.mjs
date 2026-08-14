//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app.mjs
 * @description The Awtsmoos lets search, learning, API/project/system exploration, and documents behave as one living browser map with source beneath every view.
 */

import { initializeInteractiveLayers } from "./app-interactive.mjs";
import { renderApplicationView } from "./app-view-router.mjs";
import { loadDataset } from "./data.mjs";
import { applicationElements } from "./elements.mjs";
import { renderError } from "./error-view.mjs";
import { scrollToHeading } from "./document-view.mjs";
import * as State from "./state.mjs";
import { initializeTheme } from "./theme.mjs";
import { createToast } from "./toast.mjs";
import { createViewNavigation } from "./view-navigation.mjs";

const elements = applicationElements();
const toast = createToast(elements.toast);
let dataset = null;
let renderGeneration = 0;
let interactive = null;

function closeMobileNavigation() {
	elements.navRail.dataset.open = "false";
}

const views = createViewNavigation(State, closeMobileNavigation);

function viewActions() {
	const openProject = id => State.navigate({ view: "projects", doc: "", project: id, heading: "" });
	return {
		openDocument: views.document,
		openCategory: category => interactive.searchDialog.open(category ? `category:${category}` : ""),
		openSearch: () => interactive.searchDialog.open(),
		openLearn: views.learn,
		openApi: views.api,
		openProjects: views.projects,
		openSystems: views.systems,
		selectRoute: id => State.navigate({ view: "api", doc: "", route: id, heading: "" }),
		updateFilters: values => State.navigate({ ...values, view: "api", doc: "", heading: "" }, { replace: true }),
		selectProject: openProject,
		openProject,
		updateProjectFilters: values => State.navigate({ ...values, view: "projects", doc: "", heading: "" }, { replace: true }),
		selectSystem: id => State.navigate({ view: "systems", doc: "", system: id, heading: "" }),
		updateSystemFilters: values => State.navigate({ ...values, view: "systems", doc: "", heading: "" }, { replace: true }),
		ask: question => interactive.askDialog.open(question),
		navigate: views.document,
		heading: anchor => {
			State.navigate({ heading: anchor });
			scrollToHeading(anchor);
		},
		toast
	};
}

function viewTitle(state) {
	if (state.view === "learn") return "Learn · Awtsmoos Documentation";
	if (state.view === "api") return "API Explorer · Awtsmoos Documentation";
	if (state.view === "projects") return "Project Explorer · Awtsmoos Documentation";
	if (state.view === "systems") return "Systems Explorer · Awtsmoos Documentation";
	return "Awtsmoos Documentation";
}

async function renderState(state) {
	const generation = ++renderGeneration;
	document.title = viewTitle(state);
	try {
		await renderApplicationView({ state, dataset, elements, actions: viewActions(), generation, currentGeneration: () => renderGeneration });
	} catch (error) {
		if (generation === renderGeneration) renderError(elements.view, error);
	}
}

async function start() {
	try {
		dataset = await loadDataset();
		interactive = initializeInteractiveLayers(elements, dataset, {
			document: views.document,
			home: views.home,
			learn: views.learn,
			api: views.api,
			projects: views.projects,
			systems: views.systems
		});
		initializeTheme(elements.theme);
		State.initializeHistory();
		State.subscribe(renderState);
		elements.loading.hidden = true;
		elements.view.hidden = false;
		await renderState(State.getState());
	} catch (error) {
		elements.loading.hidden = true;
		elements.view.hidden = false;
		renderError(elements.view, error);
	}
}

void start();
